import {
  jsonBody,
  labUser,
  ownedApplication,
  labResponseError,
  rateLimit,
  LabError,
} from "@/lib/labs/server";
import { createServiceClient } from "@/lib/supabase/server";
import { beginLabCheckout } from "@/lib/labs/payments";

export async function POST(request: Request) {
  try {
    const body = await jsonBody(request),
      user = await labUser();
    await rateLimit(`checkout:${user.id}`, 20);
    const app = await ownedApplication(body.applicationId, user.id);
    if (body.acceptTerms !== true)
      throw new LabError("Read and accept the cohort terms before enrolling.");
    const { data: cohort, error } = await createServiceClient()
      .from("ccc_bl_cohorts")
      .select("price_cents,terms")
      .eq("id", app.cohort_id)
      .single();
    if (error || !cohort) throw new LabError("Cohort is unavailable.", 503);
    if (body.priceCents !== cohort.price_cents || body.terms !== cohort.terms)
      throw new LabError(
        "The cohort details changed. Refresh and review them before paying.",
        409,
      );
    if (!user.email) throw new LabError("A verified email is required.", 403);
    return Response.json(
      await beginLabCheckout(
        app.id,
        user.id,
        user.email,
        cohort.price_cents,
        cohort.terms,
      ),
    );
  } catch (error) {
    return labResponseError(error);
  }
}
