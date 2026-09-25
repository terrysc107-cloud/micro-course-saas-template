import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { ownerApplication } = require("../lib/labs/privacy.ts");
import { PGlite } from "@electric-sql/pglite";
const {
  APPLICATION_FIELDS,
  INTAKE_FIELDS,
  validateAnswers,
  safeWebUrl,
  safeRedirect,
  isLearningPlan,
} = require("../lib/labs/intake.ts");

test("questionnaire rejects missing answers, invalid options, unsafe URLs and oversized values", () => {
  const result = validateAnswers(
    { owner: "Terry", experience: "fake option", offer: "x".repeat(1501) },
    APPLICATION_FIELDS,
    true,
  );
  assert.ok(result.errors.business);
  assert.ok(result.errors.experience);
  assert.ok(result.errors.offer);
  assert.deepEqual(validateAnswers({}, INTAKE_FIELDS, false).errors, {});
  assert.equal(safeWebUrl("javascript:alert(1)"), false);
  assert.equal(safeWebUrl("https://user:password@example.com"), false);
  assert.equal(safeWebUrl("https://example.com/work"), true);
  assert.equal(
    validateAnswers({ website: "javascript:alert(1)" }, INTAKE_FIELDS, false)
      .errors.website.length > 0,
    true,
  );
});
test("return paths cannot become external or executable navigation", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "javascript:alert(1)",
    "/\\evil.example",
    "/\n/evil",
  ])
    assert.equal(safeRedirect(value), "/dashboard");
  assert.equal(safeRedirect("/lab-studio"), "/lab-studio");
});
test("AI outputs require exactly four ordered weeks and all guide sections", () => {
  const plan = {
    businessBrief: "Brief",
    objective: "Objective",
    assumptions: [],
    preparation: [],
    agentCharter: "Charter",
    operatingGuide: "Guide",
    instructorNotes: "Notes",
    weeks: [1, 2, 3, 4].map((week) => ({
      week,
      objective: "Goal",
      deliverable: "Artifact",
      acceptance: "Evidence",
    })),
  };
  assert.equal(isLearningPlan(plan), true);
  assert.equal(
    isLearningPlan({ ...plan, weeks: plan.weeks.slice(0, 3) }),
    false,
  );
  assert.equal(
    isLearningPlan({ ...plan, weeks: [...plan.weeks].reverse() }),
    false,
  );
  assert.equal(isLearningPlan({ ...plan, instructorNotes: null }), false);
});

test("Postgres migration, seat concurrency, payment replay, refunds and database permissions", async (t) => {
  const db = new PGlite();
  await db.exec(
    "CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);",
  );
  const migration = await readFile(
    new URL(
      "../supabase/migrations/20260925010000_build_lab_series.sql",
      import.meta.url,
    ),
    "utf8",
  );
  await db.exec(migration);
  await db.exec(migration); // re-running is harmless
  const users = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ];
  for (const id of users)
    await db.query("INSERT INTO auth.users(id) VALUES($1)", [id]);
  const cohort = (
    await db.query(
      "UPDATE ccc_bl_cohorts SET capacity=1,status='enrollment_open',starts_at=now()+interval '30 days',stripe_price_id='price_test',terms='Confirmed test enrollment terms.',session_dates='[\"2026-11-01T19:00:00Z\",\"2026-11-08T19:00:00Z\",\"2026-11-15T19:00:00Z\",\"2026-11-22T19:00:00Z\"]' RETURNING id",
    )
  ).rows[0].id;
  const apps = [];
  for (const user of users)
    apps.push(
      (
        await db.query(
          "INSERT INTO ccc_bl_applications(cohort_id,user_id,email,status) VALUES($1,$2,'test@example.com','accepted') RETURNING id",
          [cohort, user],
        )
      ).rows[0].id,
    );
  await t.test("two buyers cannot hold the same last seat", async () => {
    const results = await Promise.allSettled(
      apps.map((app, i) =>
        db.query(
          "SELECT * FROM ccc_bl_reserve($1,$2,199500,'Confirmed test enrollment terms.')",
          [app, users[i]],
        ),
      ),
    );
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.match(
      results.find((r) => r.status === "rejected").reason.message,
      /full/,
    );
  });
  const reservation = (await db.query("SELECT * FROM ccc_bl_reservations"))
    .rows[0];
  await t.test(
    "retry reuses a hold and another user cannot claim it",
    async () => {
      const again = (
        await db.query(
          "SELECT * FROM ccc_bl_reserve($1,$2,199500,'Confirmed test enrollment terms.')",
          [reservation.application_id, reservation.user_id],
        )
      ).rows[0];
      assert.equal(again.id, reservation.id);
      await assert.rejects(
        db.query(
          "SELECT * FROM ccc_bl_reserve($1,$2,199500,'Confirmed test enrollment terms.')",
          [
            reservation.application_id,
            users.find((u) => u !== reservation.user_id),
          ],
        ),
        /accepted/,
      );
    },
  );
  await t.test(
    "quoted price and terms must match and acceptance stays locked during payment",
    async () => {
      await assert.rejects(
        db.query("SELECT * FROM ccc_bl_reserve($1,$2,$3,$4)", [
          reservation.application_id,
          reservation.user_id,
          1,
          "old terms",
        ]),
        /terms changed/,
      );
      await assert.rejects(
        db.query("SELECT ccc_bl_review($1,$2,$3)", [
          reservation.application_id,
          "declined",
          "Review",
        ]),
        /Reconcile/,
      );
      await db.query("SELECT ccc_bl_review($1,$2,$3)", [
        reservation.application_id,
        "accepted",
        "Private review notes",
      ]);
    },
  );
  await t.test(
    "a timestamp alone never frees an uncertain checkout",
    async () => {
      await db.query(
        "UPDATE ccc_bl_reservations SET checkout_expires_at=now()-interval '1 hour' WHERE id=$1",
        [reservation.id],
      );
      const i = apps.findIndex((a) => a !== reservation.application_id);
      await assert.rejects(
        db.query(
          "SELECT * FROM ccc_bl_reserve($1,$2,199500,'Confirmed test enrollment terms.')",
          [apps[i], users[i]],
        ),
        /full/,
      );
    },
  );
  await t.test("wrong amount or currency cannot grant access", async () => {
    await assert.rejects(
      db.query("SELECT ccc_bl_fulfill($1,$2,$3,$4,$5)", [
        reservation.id,
        "cs_1",
        1,
        "usd",
        "pi_1",
      ]),
      /amount mismatch/,
    );
    await assert.rejects(
      db.query("SELECT ccc_bl_fulfill($1,$2,$3,$4,$5)", [
        reservation.id,
        "cs_1",
        199500,
        "eur",
        "pi_1",
      ]),
      /amount mismatch/,
    );
    for (const params of [
      [reservation.id, "cs_1", null, "usd", "pi_1"],
      [reservation.id, "cs_1", 199500, null, "pi_1"],
      [reservation.id, null, 199500, "usd", "pi_1"],
      [reservation.id, "cs_1", 199500, "usd", null],
    ]) {
      await assert.rejects(
        db.query("SELECT ccc_bl_fulfill($1,$2,$3,$4,$5)", params),
        /mismatch|missing/,
      );
    }
    assert.equal(
      (await db.query("SELECT * FROM ccc_bl_enrollments")).rows.length,
      0,
    );
  });
  await t.test(
    "duplicate webhooks produce one paid enrollment; a second session is rejected",
    async () => {
      for (let i = 0; i < 2; i++)
        await db.query("SELECT ccc_bl_fulfill($1,$2,$3,$4,$5)", [
          reservation.id,
          "cs_1",
          199500,
          "usd",
          "pi_1",
        ]);
      assert.equal(
        (await db.query("SELECT * FROM ccc_bl_enrollments")).rows.length,
        1,
      );
      await assert.rejects(
        db.query("SELECT ccc_bl_fulfill($1,$2,$3,$4,$5)", [
          reservation.id,
          "cs_other",
          199500,
          "usd",
          "pi_1",
        ]),
        /Session mismatch/,
      );
    },
  );
  await t.test(
    "refund revokes lab access and late payment event cannot restore it",
    async () => {
      await db.query("SELECT ccc_bl_refund($1,$2)", ["pi_1", reservation.id]);
      assert.equal(
        (await db.query("SELECT status FROM ccc_bl_enrollments")).rows[0]
          .status,
        "refunded",
      );
      await assert.rejects(
        db.query("SELECT ccc_bl_fulfill($1,$2,$3,$4,$5)", [
          reservation.id,
          "cs_1",
          199500,
          "usd",
          "pi_1",
        ]),
        /no longer payable/,
      );
    },
  );
  await t.test(
    "clients cannot read private data or self-grant seats",
    async () => {
      await db.exec("SET ROLE authenticated");
      await assert.rejects(
        db.query("SELECT * FROM public.ccc_bl_applications"),
        /permission denied/,
      );
      await assert.rejects(
        db.query(
          "SELECT * FROM public.ccc_bl_reserve($1,$2,199500,'Confirmed test enrollment terms.')",
          [apps[0], users[0]],
        ),
        /permission denied/,
      );
      await db.exec("RESET ROLE");
    },
  );
  await t.test(
    "rate limits are durable and reject excess requests",
    async () => {
      for (let i = 0; i < 3; i++) {
        const result = (
          await db.query("SELECT ccc_bl_rate_limit($1,$2,$3) AS allowed", [
            "test",
            2,
            3600,
          ])
        ).rows[0];
        assert.equal(result.allowed, i < 2);
      }
    },
  );
  await db.close();
});

test("student payload excludes private drafts, notes, unknown fields and stale plans", () => {
  const app = {
    id: "app",
    intake_revision: 2,
    published_revision: 2,
    draft_plan: { secret: "draft" },
    instructor_notes: "private",
    generation_error: "internal",
    future_private_field: "secret",
    published_plan: {
      businessBrief: "Public",
      instructorNotes: "Private notes",
      extra: "secret",
    },
  };
  const safe = ownerApplication(app);
  for (const key of [
    "draft_plan",
    "instructor_notes",
    "generation_error",
    "future_private_field",
  ])
    assert.equal(key in safe, false);
  assert.equal(safe.published_plan.instructorNotes, "");
  assert.equal("extra" in safe.published_plan, false);
  assert.equal(
    ownerApplication({ ...app, intake_revision: 3 }).published_plan,
    null,
  );
});
