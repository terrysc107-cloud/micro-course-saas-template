import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileText,
  SlidersHorizontal,
  Users,
  CheckCircle2,
  CornerDownRight,
} from "lucide-react";
import LabShell from "@/components/labs/LabShell";
import InterestForm from "@/components/labs/InterestForm";
import { FOUNDATION, LABS, LAB_FAQ, formatPrice } from "@/lib/labs/catalog";
import { publicCohorts } from "@/lib/labs/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "The Build Lab — Build your AI operating company | AIxDesign",
  description:
    "Four-week live labs for business owners. Build your AI CEO and board with personalized preparation, live reviews, and working business deliverables.",
  alternates: { canonical: "/build-lab" },
  openGraph: {
    title: "Your business. Your AI team. Built together.",
    description: "The Build Lab series by AIxDesign.",
    url: "/build-lab",
  },
};

export default async function Page() {
  const cohort = (await publicCohorts()).find(
    (c) => c.program_slug === FOUNDATION.slug,
  );
  const start = cohort?.starts_at
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: cohort.timezone,
      }).format(new Date(cohort.starts_at))
    : null;
  return (
    <LabShell>
      <section className="lab-container lab-hero">
        <div>
          <p className="lab-eyebrow">
            The Build Lab · Live, four-week programs
          </p>
          <h1>
            Your business.
            <br />
            Your AI team.
            <br />
            <em>Built together.</em>
          </h1>
          <p className="lab-lead">
            Give your agent an identity. Teach it your business. Build a system
            you can lead—with Terry in the room, working through the decisions
            with you.
          </p>
          <div className="lab-actions">
            <Link className="lab-button" href="#foundation">
              Start with your AI company <ArrowRight size={17} />
            </Link>
            <Link className="lab-text-link" href="#labs">
              Explore the series
            </Link>
          </div>
          <div className="lab-small lab-hero-note">
            {["Beginner-friendly", "Your own business", "Live review"].map(
              (t) => (
                <span key={t}>
                  <Check size={13} />
                  {t}
                </span>
              ),
            )}
          </div>
        </div>
        <div
          className="lab-artifact"
          aria-label="Illustrative workspace, not an actual student result"
        >
          <div className="lab-artifact-top">
            <span>YOUR OPERATING COMPANY</span>
            <div className="lab-dots">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="lab-artifact-body">
            <span className="lab-chip blue">AN EXAMPLE OF WHAT YOU BUILD</span>
            <h3>
              From your knowledge
              <br />
              to a working system.
            </h3>
            {[
              [
                "01",
                "Business context",
                "Customers, offers, tools, and goals",
                "VERIFIED",
              ],
              [
                "02",
                "Agent identity",
                "Values, voice, and decision rights",
                "DEFINED",
              ],
              [
                "03",
                "Your CEO & board",
                "Roles that examine real decisions",
                "WORKING",
              ],
              [
                "04",
                "Standing work",
                "One workflow, with your review",
                "TESTED",
              ],
            ].map(([n, title, detail, status]) => (
              <div className="lab-artifact-row" key={n}>
                <span className="lab-small">{n}</span>
                <div style={{ flex: 1 }}>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </div>
                <span className="lab-chip">{status}</span>
              </div>
            ))}
          </div>
          <div className="lab-artifact-foot">
            <CornerDownRight size={16} />
            You set the direction. Your system carries the context.
          </div>
        </div>
      </section>
      <div className="lab-container lab-method-strip">
        {[
          "Prepare for your business",
          "Build in the session",
          "Review real deliverables",
          "Leave knowing how to run it",
        ].map((s, i) => (
          <div key={s}>
            <span>0{i + 1}</span>
            <strong>{s}</strong>
          </div>
        ))}
      </div>
      <section id="the-method" className="lab-container lab-section">
        <div className="lab-section-heading">
          <div>
            <p className="lab-eyebrow">The method</p>
            <h2>
              One shared path.
              <br />
              Your business at every step.
            </h2>
          </div>
          <p>
            We learn where you’re starting before the first session. Then we
            work toward the same capabilities, using your own tools and
            decisions.
          </p>
        </div>
        <div className="lab-grid">
          {[
            {
              icon: FileText,
              title: "Before we meet",
              body: "Your business questionnaire becomes a preparation plan: what to bring, what to set up, and what to build first.",
            },
            {
              icon: Users,
              title: "While we build",
              body: "Bring your work to class. See how others approach theirs. Review, correct, and make the next decision together.",
            },
            {
              icon: SlidersHorizontal,
              title: "As you progress",
              body: "Weekly deliverables show what works and where you need help. Your instructor adjusts your objectives with you.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <article className="lab-card" key={title}>
              <div className="lab-card-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="lab-dark lab-section">
        <div className="lab-container">
          <p className="lab-eyebrow">The foundation lab</p>
          <div className="lab-section-heading">
            <h2>
              Four weeks to build
              <br />
              your operating foundation.
            </h2>
            <p>
              Each week ends with something you can demonstrate, review, and use
              again.
            </p>
          </div>
          <div className="lab-week-grid">
            {FOUNDATION.weeks.map((w, i) => (
              <article className="lab-week" key={w.title}>
                <span className="lab-week-num">
                  WEEK 0{i + 1} / {w.theme.toUpperCase()}
                </span>
                <h3>{w.title}</h3>
                <p>{w.deliverable}</p>
                <small>Build → Review → Adjust</small>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="labs" className="lab-container lab-section">
        <div className="lab-section-heading">
          <div>
            <p className="lab-eyebrow">Build your next capability</p>
            <h2>
              A foundation first.
              <br />
              Then, your next lab.
            </h2>
          </div>
          <p>
            The series grows with your business. Future topics open as cohorts
            are scheduled. Join the list for what you want to build next.
          </p>
        </div>
        <article
          id="foundation"
          className="lab-foundation"
          style={{ scrollMarginTop: 110 }}
        >
          <div className="lab-foundation-copy">
            <span className="lab-chip blue">01 · START HERE</span>
            <h3>{FOUNDATION.title}</h3>
            <p>{LABS[0].description}</p>
            <p style={{ marginTop: 20 }}>
              For owners with an existing business or a clearly defined offer,
              and time to practice between sessions. No coding experience
              required.
            </p>
            <div className="lab-actions">
              <Link href="/lab-studio" className="lab-text-link">
                Already applied? Open your workspace <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="lab-price-panel">
            <p className="lab-small">
              {cohort ? "FOUNDING COHORT TUITION" : "PLANNED FOUNDING TUITION"}
            </p>
            <div className="lab-price">
              {formatPrice(
                cohort?.price_cents ?? FOUNDATION.suggestedPriceCents,
              )}
            </div>
            <p className="lab-small">One payment · software costs separate</p>
            {cohort && (
              <p className="lab-small" style={{ marginTop: 10 }}>
                Up to {cohort.capacity} owners in this cohort, with time for
                live review.
              </p>
            )}
            <ul>
              {[
                "Four live working sessions",
                "A reviewed plan for your business",
                "Agent charter and operating guide",
                "Weekly deliverable feedback",
                "My AI Board foundation course",
              ].map((s) => (
                <li key={s}>
                  <CheckCircle2 size={16} color="#175ed0" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="lab-small" style={{ marginBottom: 17 }}>
              {start
                ? `Starts ${start}. Full schedule and terms are shown before payment.`
                : "Dates will be confirmed before enrollment. Applying does not reserve a seat or charge you."}
            </p>
            <Link className="lab-button" href="/lab-studio?apply=true">
              Start your application <ArrowRight size={16} />
            </Link>
            <p className="lab-small" style={{ marginTop: 13 }}>
              Create a free account to save your application.
            </p>
          </div>
        </article>
        <div className="lab-catalog-grid">
          {LABS.slice(1).map((lab) => (
            <article className="lab-catalog-card" key={lab.slug}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="lab-small">
                  {lab.number} / {lab.category}
                </span>
                <span className="lab-chip">FUTURE LAB · INTEREST LIST</span>
              </div>
              <h3>{lab.title}</h3>
              <p>{lab.description}</p>
              <p className="lab-small">
                <strong>Starting point:</strong> {lab.prerequisite}
              </p>
              <InterestForm program={lab.slug} />
            </article>
          ))}
        </div>
      </section>
      <section
        className="lab-section"
        style={{
          background: "#edf3fb",
          borderTop: "1px solid #e3eaf3",
          borderBottom: "1px solid #e3eaf3",
        }}
      >
        <div className="lab-container" style={{ display: "grid", gap: 22 }}>
          <p className="lab-eyebrow" style={{ marginBottom: 0 }}>
            Your instructor
          </p>
          <h2>
            Built from operating.
            <br />
            Taught through doing.
          </h2>
          <p className="lab-lead">
            Terry Scott brings his experience leading operations, teaching
            adults through Aseptic Technical Solutions, and building AI systems
            for his own businesses. The lab puts that approach into practice:
            clear standards, working deliverables, and feedback you can act on.
          </p>
          <Link href="https://aixdesign.dev" className="lab-text-link">
            Explore AIxDesign <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="lab-container lab-section lab-faq">
        <div>
          <p className="lab-eyebrow">Before you begin</p>
          <h2>
            Good questions.
            <br />
            Clear expectations.
          </h2>
          <p className="lab-small" style={{ marginTop: 22 }}>
            Already enrolled in the earlier founding run?{" "}
            <Link href="/build-lab/legacy" className="lab-text-link">
              View that run.
            </Link>
          </p>
        </div>
        <div>
          {LAB_FAQ.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="lab-container lab-section" style={{ paddingTop: 0 }}>
        <div className="lab-panel">
          <p className="lab-eyebrow">Keep your place in the conversation</p>
          <h2>Not ready to apply yet?</h2>
          <p>Get updates when the next foundation cohort is scheduled.</p>
          <div style={{ maxWidth: 570 }}>
            <InterestForm program={FOUNDATION.slug} />
          </div>
        </div>
      </section>
    </LabShell>
  );
}
