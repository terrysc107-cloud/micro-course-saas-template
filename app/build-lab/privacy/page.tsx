import LabShell from "@/components/labs/LabShell";
export default function Page() {
  return (
    <LabShell>
      <article className="lab-container lab-section" style={{ maxWidth: 760 }}>
        <p className="lab-eyebrow">Your information</p>
        <h1 style={{ fontSize: 38, fontWeight: 650, letterSpacing: -1 }}>
          How Build Lab uses your information
        </h1>
        <div className="lab-panel" style={{ marginTop: 30 }}>
          <h2>Your application and workspace</h2>
          <p>
            We collect your account email, business answers, tools, learning
            preferences, and submitted deliverables to assess fit, prepare
            teaching, and review your progress. Your instructor can access this
            information. Other students cannot access your workspace.
          </p>
          <h3>AI-assisted preparation is optional</h3>
          <p className="lab-prose">
            If you opt in, your business answers are sent to OpenAI to draft
            objectives and guides. Your account email and instructor notes are
            excluded from that request. The instructor reviews the draft before
            publishing it to you. You may choose a manually prepared plan
            instead. Turning off consent prevents future requests; it does not
            undo a request already sent.
          </p>
          <h3>What to leave out</h3>
          <p className="lab-prose">
            Do not submit passwords, API keys, payment card details, patient
            information, customer records, or confidential documents. Describe
            your tools and document types. Share sanitized examples during
            reviews. Evidence links should be restricted to you and the
            instructor where possible.
          </p>
          <h3>Payments and session recordings</h3>
          <p className="lab-prose">
            Stripe handles payment details. The platform records enrollment and
            payment references. Teaching blocks may be recorded for the cohort;
            working sessions involving your private business information are not
            recorded.
          </p>
          <h3>Interest lists</h3>
          <p className="lab-prose">
            An interest-list signup is for updates about the selected lab. It
            does not automatically enroll you in the general newsletter or
            reserve a seat.
          </p>
          <h3>Corrections, access, and deletion requests</h3>
          <p className="lab-prose">
            You can update your questionnaire in your workspace. Changes send
            your plan back for review. Contact hello@aixdesign.dev to request
            access, correction, deletion, or removal from an interest list.
            Payment records may need to be retained for accounting obligations.
          </p>
        </div>
      </article>
    </LabShell>
  );
}
