import { getStripe } from "@/lib/stripe";
import { syncLabCheckout } from "@/lib/labs/payments";
import { after } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  APPLICATION_FIELDS,
  INTAKE_FIELDS,
  validateAnswers,
  isLearningPlan,
  safeWebUrl,
} from "@/lib/labs/intake";
import { isLabSlug } from "@/lib/labs/catalog";
import {
  checkDb,
  instructor,
  isInstructor,
  jsonBody,
  LabError,
  labResponseError,
  labsConfigured,
  labUser,
  ownedApplication,
  ownerApplication,
  paidApplication,
  publicCohorts,
  rateLimit,
  type Application,
} from "@/lib/labs/server";
import { generatePlan } from "@/lib/labs/plan";

export const runtime = "nodejs";
export const maxDuration = 120;
type Context = { params: Promise<{ action: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    const { action } = await context.params;
    if (action === "cohorts")
      return Response.json({ cohorts: await publicCohorts() });
    const user = ["instructor", "export"].includes(action)
      ? await instructor()
      : await labUser();
    const db = createServiceClient();
    if (action === "export") {
      const { data, error } = await db
        .from("ccc_bl_interest")
        .select("program_slug,email,created_at")
        .order("created_at");
      checkDb(error);
      const csvCell = (value: string) =>
        '"' +
        (/^[=+@\-]/.test(value) ? "'" : "") +
        value.replaceAll('"', '""') +
        '"';
      const csv = [
        "program,email,joined_at",
        ...(data ?? []).map((row) =>
          [row.program_slug, row.email, row.created_at].map(csvCell).join(","),
        ),
      ].join("\r\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=build-lab-interest.csv",
          "Cache-Control": "private, no-store",
        },
      });
    }
    if (action === "workspace") {
      const [apps, enrollments] = await Promise.all([
        db
          .from("ccc_bl_applications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        db
          .from("ccc_bl_enrollments")
          .select("application_id,status")
          .eq("user_id", user.id),
      ]);
      checkDb(apps.error);
      checkDb(enrollments.error);
      const ids = (apps.data ?? []).map((a) => a.id);
      const submissions = ids.length
        ? await db
            .from("ccc_bl_submissions")
            .select("*")
            .in("application_id", ids)
        : { data: [], error: null };
      checkDb(submissions.error);
      const cohortIds = (apps.data ?? []).map((a) => a.cohort_id);
      const cohorts = cohortIds.length
        ? await db
            .from("ccc_bl_cohorts")
            .select(
              "id,slug,program_slug,title,status,capacity,price_cents,currency,starts_at,timezone,session_dates,terms",
            )
            .in("id", cohortIds)
        : { data: [], error: null };
      checkDb(cohorts.error);
      return Response.json(
        {
          applications: (apps.data ?? []).map((a) =>
            ownerApplication(a as Application),
          ),
          enrollments: enrollments.data,
          submissions: submissions.data,
          cohorts: cohorts.data,
          instructor: isInstructor(user.id),
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    if (action === "instructor") {
      const [apps, enrollments, submissions, cohorts, interest, reservations] =
        await Promise.all([
          db
            .from("ccc_bl_applications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(250),
          db.from("ccc_bl_enrollments").select("application_id,status"),
          db.from("ccc_bl_submissions").select("*"),
          db.from("ccc_bl_cohorts").select("*"),
          db.from("ccc_bl_interest").select("program_slug"),
          db
            .from("ccc_bl_reservations")
            .select("id,application_id,status,checkout_expires_at")
            .eq("status", "held"),
        ]);
      for (const result of [
        apps,
        enrollments,
        submissions,
        cohorts,
        interest,
        reservations,
      ])
        checkDb(result.error);
      return Response.json(
        {
          applications: apps.data,
          enrollments: enrollments.data,
          submissions: submissions.data,
          cohorts: cohorts.data,
          reservations: reservations.data,
          interest: interest.data,
        },
        { headers: { "Cache-Control": "private, no-store" } },
      );
    }
    throw new LabError("Not found.", 404);
  } catch (error) {
    return labResponseError(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { action } = await context.params;
    const body = await jsonBody(request);
    if (!labsConfigured())
      throw new LabError(
        "Registration is being prepared. Please try again later.",
        503,
      );
    const db = createServiceClient();
    if (action === "interest") {
      if (body.website) return Response.json({ saved: true }); // honeypot
      if (
        !isLabSlug(body.program) ||
        typeof body.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.email.trim()) ||
        body.email.length > 254
      )
        throw new LabError("Enter a valid email and choose a lab.");
      await rateLimit(
        `interest:${request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "unknown"}`,
        10,
      );
      await rateLimit("interest-global", 2000);
      const { error } = await db
        .from("ccc_bl_interest")
        .insert({
          email: body.email.trim().toLowerCase(),
          program_slug: body.program,
        });
      if (error?.code !== "23505") checkDb(error);
      return Response.json({ saved: true });
    }
    const adminActions = [
      "review",
      "generate",
      "publish",
      "feedback",
      "reconcile",
    ];
    const user = adminActions.includes(action)
      ? await instructor()
      : await labUser();
    await rateLimit(`${action}:${user.id}`, action === "generate" ? 15 : 120);
    if (action === "reconcile") {
      const { data: holds, error } = await db
        .from("ccc_bl_reservations")
        .select("id,stripe_session_id")
        .eq("status", "held")
        .lt("checkout_expires_at", new Date().toISOString())
        .limit(25);
      checkDb(error);
      let reconciled = 0,
        manual = 0;
      for (const hold of holds ?? []) {
        if (!hold.stripe_session_id) {
          manual++;
          continue;
        }
        await syncLabCheckout(
          await getStripe().checkout.sessions.retrieve(hold.stripe_session_id),
        );
        reconciled++;
      }
      return Response.json({
        saved: true,
        message: `Checked ${reconciled} Stripe sessions. ${manual} holds have no recorded Stripe session and need manual verification.`,
      });
    }
    if (action === "apply") {
      if (typeof body.cohortId !== "string")
        throw new LabError("Choose an open cohort.");
      const cohorts = await publicCohorts();
      if (
        !cohorts.some(
          (c) =>
            c.id === body.cohortId &&
            (!c.starts_at || new Date(c.starts_at) > new Date()),
        )
      )
        throw new LabError("Applications for this cohort are closed.", 409);
      const { answers, errors } = validateAnswers(
        body.answers,
        APPLICATION_FIELDS,
        true,
      );
      if (Object.keys(errors).length)
        return Response.json(
          { error: "Check the highlighted answers.", fields: errors },
          { status: 400 },
        );
      if (body.consent !== true)
        throw new LabError("Confirm that we can review your application.");
      const { error } = await db
        .from("ccc_bl_applications")
        .insert({
          cohort_id: body.cohortId,
          user_id: user.id,
          email: user.email,
          answers,
        });
      if (error?.code !== "23505") checkDb(error);
      return Response.json({ saved: true });
    }
    if (action === "intake") {
      const app = await paidApplication(body.applicationId, user.id);
      if (body.revision !== app.intake_revision)
        throw new LabError(
          "Your questionnaire changed in another tab. Reload before saving.",
          409,
        );
      const complete = body.submit === true;
      const { answers, errors } = validateAnswers(
        body.answers,
        INTAKE_FIELDS,
        complete,
      );
      if (Object.keys(errors).length)
        return Response.json(
          { error: "Check the highlighted answers.", fields: errors },
          { status: 400 },
        );
      const revision = app.intake_revision + 1;
      const { data, error } = await db
        .from("ccc_bl_applications")
        .update({
          intake: answers,
          intake_status: complete ? "submitted" : "draft",
          intake_revision: revision,
          ai_consent: body.aiConsent === true,
          published_plan: null,
          published_revision: null,
          published_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", app.id)
        .eq("user_id", user.id)
        .eq("intake_revision", app.intake_revision)
        .select("id")
        .maybeSingle();
      checkDb(error);
      if (!data)
        throw new LabError(
          "Your questionnaire changed. Reload before saving.",
          409,
        );
      if (
        complete &&
        body.aiConsent === true &&
        process.env.OPENAI_API_KEY &&
        process.env.LAB_AI_MODEL
      )
        after(async () => {
          try {
            await generatePlan(app.id);
          } catch {
            console.error(
              "[labs] automatic draft requires instructor follow-up",
            );
          }
        });
      return Response.json({ saved: true, revision });
    }
    if (action === "submit") {
      const app = await paidApplication(body.applicationId, user.id);
      if (
        !Number.isInteger(body.week) ||
        Number(body.week) < 1 ||
        Number(body.week) > 4
      )
        throw new LabError("Choose a valid week.");
      if (
        typeof body.notes !== "string" ||
        !body.notes.trim() ||
        body.notes.length > 4000
      )
        throw new LabError("Describe your work in 1–4,000 characters.");
      const link =
        typeof body.evidenceUrl === "string" ? body.evidenceUrl.trim() : "";
      if (link && (link.length > 2000 || !safeWebUrl(link)))
        throw new LabError("Use a complete http:// or https:// evidence link.");
      const { data: old, error: oldError } = await db
        .from("ccc_bl_submissions")
        .select("id,version")
        .eq("application_id", app.id)
        .eq("week", body.week)
        .maybeSingle();
      checkDb(oldError);
      if (old && body.version !== old.version)
        throw new LabError(
          "This deliverable changed. Reload before resubmitting.",
          409,
        );
      const values = {
        application_id: app.id,
        week: body.week,
        notes: body.notes.trim(),
        evidence_url: link,
        status: "submitted",
        feedback: "",
        version: (old?.version ?? 0) + 1,
        updated_at: new Date().toISOString(),
      };
      const result = old
        ? await db
            .from("ccc_bl_submissions")
            .update(values)
            .eq("id", old.id)
            .eq("version", old.version)
            .select("id")
            .maybeSingle()
        : await db
            .from("ccc_bl_submissions")
            .insert(values)
            .select("id")
            .single();
      checkDb(result.error);
      if (!result.data)
        throw new LabError(
          "The deliverable changed. Reload and try again.",
          409,
        );
      return Response.json({ saved: true });
    }
    if (adminActions.includes(action)) {
      const { data: app, error } = await db
        .from("ccc_bl_applications")
        .select("*")
        .eq("id", body.applicationId)
        .maybeSingle();
      checkDb(error);
      if (!app) throw new LabError("Application not found.", 404);
      if (action === "review") {
        if (
          !["accepted", "waitlisted", "declined", "submitted"].includes(
            String(body.status),
          )
        )
          throw new LabError("Choose a review status.");
        const { error: reviewError } = await db.rpc("ccc_bl_review", {
          p_application: app.id,
          p_status: body.status,
          p_notes: String(body.notes ?? "").slice(0, 4000),
        });
        if (reviewError)
          throw new LabError(
            "Acceptance could not change. Reconcile held or paid enrollment first.",
            409,
          );
      }
      if (action === "generate")
        await generatePlan(app.id, body.mode !== "manual");
      if (action === "publish") {
        if (!isLearningPlan(body.plan))
          throw new LabError(
            "Complete all four weeks and plan sections before publishing.",
          );
        if (
          app.intake_status !== "submitted" ||
          app.intake_revision !== body.revision
        )
          throw new LabError(
            "The questionnaire changed. Review the current version first.",
            409,
          );
        const { data: saved, error: saveError } = await db
          .from("ccc_bl_applications")
          .update({
            draft_plan: body.plan,
            plan_revision: body.revision,
            ...(body.publish === true
              ? {
                  published_plan: body.plan,
                  published_revision: body.revision,
                  published_at: new Date().toISOString(),
                }
              : {}),
          })
          .eq("id", app.id)
          .eq("intake_revision", body.revision)
          .eq("intake_status", "submitted")
          .select("id")
          .maybeSingle();
        checkDb(saveError);
        if (!saved)
          throw new LabError(
            "The questionnaire changed during review. Reload first.",
            409,
          );
      }
      if (action === "feedback") {
        if (
          !["approved", "revision_requested"].includes(String(body.status)) ||
          typeof body.feedback !== "string" ||
          !body.feedback.trim() ||
          body.feedback.length > 4000
        )
          throw new LabError("Add feedback and choose a review outcome.");
        const { data: saved, error: saveError } = await db
          .from("ccc_bl_submissions")
          .update({
            status: body.status,
            feedback: body.feedback.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", body.submissionId)
          .eq("application_id", app.id)
          .eq("version", body.version)
          .select("id")
          .maybeSingle();
        checkDb(saveError);
        if (!saved)
          throw new LabError(
            "The owner submitted a newer version. Review that version first.",
            409,
          );
      }
      return Response.json({ saved: true });
    }
    throw new LabError("Not found.", 404);
  } catch (error) {
    return labResponseError(error);
  }
}
