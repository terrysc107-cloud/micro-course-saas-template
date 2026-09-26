// Run against a local dev/preview server. Fixtures are browser-only; no real
// accounts, enrollment grants, emails, AI requests, or payments are created.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const base = process.env.LAB_BROWSER_URL ?? "http://localhost:3100";
const output = "docs/build-lab/screenshots";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.LAB_BROWSER_EXECUTABLE
    ? { executablePath: process.env.LAB_BROWSER_EXECUTABLE }
    : {}),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/build-lab");
  await page
    .getByRole("heading", {
      name: "Your business. Your AI team. Built together.",
    })
    .waitFor();
  await page.screenshot({
    path: output + "/landing-desktop.png",
    fullPage: true,
  });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `overflow at ${width}px`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: output + "/landing-mobile.png",
    fullPage: true,
  });
  const cohort = {
    id: "cohort-fixture",
    title: "Fixture cohort",
    slug: "fixture",
    program_slug: "ai-operating-company",
    status: "applications_open",
    price_cents: 199500,
    capacity: 8,
    starts_at: null,
    timezone: "America/New_York",
    session_dates: [],
    terms: "",
    stripe_price_id: null,
  };
  const app = {
    id: "application-fixture",
    cohort_id: cohort.id,
    answers: {
      business: "Example Studio — test fixture",
      owner: "Example Owner",
    },
    email: "fixture@example.com",
    status: "accepted",
    intake: {},
    intake_status: "draft",
    intake_revision: 0,
    ai_consent: false,
    draft_plan: null,
    plan_revision: null,
    published_plan: null,
    published_revision: null,
    published_at: null,
    instructor_notes: "",
  };
  await page.route("**/api/labs/**", (route) => {
    const action = new URL(route.request().url()).pathname.split("/").at(-1);
    return route.fulfill({
      json:
        action === "cohorts"
          ? { cohorts: [cohort] }
          : {
              applications: [app],
              cohorts: [cohort],
              enrollments: [{ application_id: app.id, status: "paid" }],
              submissions: [],
              interest: [],
              reservations: [],
              instructor: true,
            },
    });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + "/lab-studio");
  await page
    .getByRole("button", { name: "Open questionnaire", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Your business", exact: true })
    .waitFor();
  await page.screenshot({
    path: output + "/questionnaire-fixture.png",
    fullPage: true,
  });
  await page.goto(base + "/lab-studio/instructor");
  await page.getByRole("heading", { name: "Your review queue" }).waitFor();
  await page.screenshot({
    path: output + "/instructor-fixture.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS layout widths, page errors, questionnaire and instructor fixtures. Screenshots:",
    output,
  );
} finally {
  await browser.close();
}
