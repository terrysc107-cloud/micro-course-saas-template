import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React from "react";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost:3100",
});
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "Node",
  "Event",
  "MouseEvent",
  "MutationObserver",
  "FormData",
  "self",
])
  globalThis[key] = dom.window[key];
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { render, fireEvent, waitFor, cleanup } =
  await import("@testing-library/react");
const { default: IntakeWizard } =
  await import("../components/labs/IntakeWizard.tsx");
const { default: ApplicationForm } =
  await import("../components/labs/ApplicationForm.tsx");
const { default: PlanEditor } =
  await import("../components/labs/PlanEditor.tsx");
const { default: Deliverables } =
  await import("../components/labs/Deliverables.tsx");
const { default: InterestForm } =
  await import("../components/labs/InterestForm.tsx");
const { INTAKE_SECTIONS, APPLICATION_FIELDS } =
  await import("../lib/labs/intake.ts");
const originalFetch = globalThis.fetch;
afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});
const application = {
  id: "11111111-1111-4111-8111-111111111111",
  answers: { business: "Fixture Studio" },
  intake: {},
  intake_revision: 0,
  intake_status: "draft",
  ai_consent: false,
  published_plan: null,
};
const plan = {
  businessBrief: "Fixture Studio serves local owners.",
  objective: "Prepare a weekly business brief.",
  assumptions: ["Owner will verify sources."],
  preparation: ["Bring sanitized sample records."],
  agentCharter: "Require owner approval before external actions.",
  operatingGuide: "Verify inputs. Review output. Record corrections.",
  instructorNotes: "Private preparation note.",
  weeks: [1, 2, 3, 4].map((week) => ({
    week,
    objective: `Week ${week} goal`,
    deliverable: `Week ${week} artifact`,
    acceptance: `Week ${week} demonstration`,
  })),
};
function mock(handler) {
  globalThis.fetch = async (url, options) => {
    const result = await handler(
      String(url),
      options?.body ? JSON.parse(options.body) : null,
    );
    return Response.json(result?.body ?? { saved: true }, {
      status: result?.status ?? 200,
    });
  };
}
function fillFields(ui, fields) {
  for (const field of fields) {
    if (!field.required) continue;
    const input = ui.getByLabelText(field.label, { exact: false });
    fireEvent.change(input, {
      target: {
        value: field.options?.[0] ?? `Fixture answer for ${field.key}`,
      },
    });
  }
}

test("application collects required business context and consent before saving", async () => {
  const calls = [];
  let saved = 0;
  mock((url, body) => {
    calls.push({ url, body });
  });
  const ui = render(
    React.createElement(ApplicationForm, {
      cohorts: [
        {
          id: "cohort",
          title: "Fixture founding cohort",
          price_cents: 199500,
          starts_at: null,
        },
      ],
      onSaved: () => saved++,
    }),
  );
  fillFields(ui, APPLICATION_FIELDS);
  fireEvent.click(ui.getByRole("checkbox"));
  fireEvent.submit(ui.container.querySelector("form"));
  await waitFor(() => assert.equal(saved, 1));
  assert.equal(calls[0].body.cohortId, "cohort");
  assert.equal(calls[0].body.consent, true);
  assert.equal(calls[0].body.answers.business, "Fixture answer for business");
});

test("questionnaire saves drafts, advances four sections, and submits manual preparation by default", async () => {
  const calls = [];
  let submitted = 0;
  mock((url, body) => {
    calls.push(body);
    return { body: { saved: true, revision: body.revision + 1 } };
  });
  const ui = render(
    React.createElement(IntakeWizard, {
      application,
      onSubmitted: () => submitted++,
      onDirty: () => {},
    }),
  );
  fireEvent.change(ui.getByLabelText(INTAKE_SECTIONS[0].fields[0].label), {
    target: { value: "Fixture customers" },
  });
  fireEvent.click(ui.getByRole("button", { name: "Save draft" }));
  await ui.findByText("Your draft is saved.");
  assert.equal(calls[0].submit, false);
  for (let step = 0; step < 4; step++) {
    fillFields(ui, INTAKE_SECTIONS[step].fields);
    fireEvent.submit(ui.container.querySelector("form"));
    if (step < 3)
      await ui.findByRole("heading", { name: INTAKE_SECTIONS[step + 1].title });
  }
  await waitFor(() => assert.equal(submitted, 1));
  const last = calls.at(-1);
  assert.equal(last.submit, true);
  assert.equal(last.aiConsent, false);
  assert.equal(last.revision, 4);
  assert.ok(last.answers.payments);
  assert.ok(last.answers.hosting);
  assert.ok(last.answers.api);
  assert.ok(last.answers.authority);
});

test("stale questionnaire save shows conflict and keeps the unsaved answer", async () => {
  mock(() => ({
    status: 409,
    body: {
      error: "Your questionnaire changed in another tab. Reload before saving.",
    },
  }));
  const ui = render(
    React.createElement(IntakeWizard, {
      application,
      onSubmitted: () => assert.fail("must not submit"),
      onDirty: () => {},
    }),
  );
  const input = ui.getByLabelText(INTAKE_SECTIONS[0].fields[0].label);
  fireEvent.change(input, { target: { value: "Keep my answer" } });
  fireEvent.click(ui.getByRole("button", { name: "Save draft" }));
  await ui.findByRole("alert");
  assert.equal(input.value, "Keep my answer");
  assert.equal(ui.getByRole("button", { name: "Save draft" }).disabled, false);
});

test("instructor edits and explicitly publishes a plan using the current revision", async () => {
  const calls = [];
  let saved = 0;
  mock((url, body) => {
    calls.push({ url, body });
  });
  const ui = render(
    React.createElement(PlanEditor, {
      app: {
        ...application,
        intake_status: "submitted",
        intake_revision: 2,
        plan_revision: 2,
        draft_plan: plan,
      },
      reload: () => saved++,
    }),
  );
  assert.equal(
    ui.getByRole("button", { name: "Prepare with AI" }).disabled,
    true,
  );
  fireEvent.change(ui.getByLabelText("Four-week objective"), {
    target: { value: "Reviewed objective" },
  });
  fireEvent.click(ui.getByRole("button", { name: "Publish reviewed plan" }));
  await waitFor(() => assert.equal(saved, 1));
  assert.equal(calls[0].body.publish, true);
  assert.equal(calls[0].body.revision, 2);
  assert.equal(calls[0].body.plan.objective, "Reviewed objective");
});

test("instructor cannot publish an older questionnaire revision", () => {
  const ui = render(
    React.createElement(PlanEditor, {
      app: {
        ...application,
        intake_status: "submitted",
        intake_revision: 3,
        plan_revision: 2,
        draft_plan: plan,
      },
      reload: () => {},
    }),
  );
  assert.equal(
    ui.getByRole("button", { name: "Publish reviewed plan" }).disabled,
    true,
  );
});

test("student sees reviewed feedback and resubmits against the existing version", async () => {
  const calls = [];
  let saved = 0;
  mock((url, body) => {
    calls.push(body);
  });
  const ui = render(
    React.createElement(Deliverables, {
      app: { ...application, published_plan: plan },
      submissions: [
        {
          id: "submission",
          week: 1,
          version: 2,
          notes: "First attempt",
          status: "revision_requested",
          feedback: "Add a missing-input test.",
          evidence_url: "",
        },
      ],
      reload: () => saved++,
    }),
  );
  assert.ok(ui.getByText("Add a missing-input test."));
  fireEvent.change(
    ui.getByLabelText("What did you build, test, or get stuck on?"),
    { target: { value: "Retested missing input and documented recovery." } },
  );
  fireEvent.submit(ui.container.querySelector("form"));
  await waitFor(() => assert.equal(saved, 1));
  assert.equal(calls[0].version, 2);
  assert.equal(calls[0].week, 1);
});

test("interest list handles a failed request and a successful retry without pretending email was sent", async () => {
  let calls = 0;
  mock(() =>
    ++calls === 1
      ? { status: 503, body: { error: "Please try again." } }
      : { body: { saved: true } },
  );
  const ui = render(
    React.createElement(InterestForm, { program: "content-and-brand" }),
  );
  fireEvent.change(ui.getByRole("textbox", { name: /email/i }), {
    target: { value: "fixture@example.com" },
  });
  fireEvent.submit(ui.container.querySelector("form"));
  await ui.findByRole("alert");
  fireEvent.submit(ui.container.querySelector("form"));
  await ui.findByRole("status");
  assert.equal(calls, 2);
});
