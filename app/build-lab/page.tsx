import type { Metadata } from "next";
import { CalendarClock, Users, Video } from "lucide-react";
import { BUILD_LAB, BRAND, DISCLAIMER, getRung } from "@/lib/course-config";
import { getLabAvailability } from "@/lib/build-lab";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Section from "@/components/marketing/Section";
import WaitlistForm from "@/components/marketing/WaitlistForm";
import LabBuyButton from "@/components/marketing/LabBuyButton";

export const metadata: Metadata = {
  title: `${BUILD_LAB.name} — ${BRAND.name}`,
  description: BUILD_LAB.description + " " + DISCLAIMER,
};

/**
 * The Build Lab page.
 *
 * Dynamic on purpose: seats-remaining is counted per request. A cached seat
 * count is a wrong seat count, and a wrong seat count is exactly the invented
 * scarcity this whole design refuses.
 *
 * Everything conditional below keys off real data. There is no date to show
 * until ccc_lab_sessions.starts_at exists, and no seat count until capacity
 * does — so while the run is a waitlist, the page simply says so.
 */
export const dynamic = "force-dynamic";

/**
 * Rewritten 2026-09-03 when the Lab became a four-week cohort.
 *
 * The old copy sold the developer product: "one real feature, start to finish"
 * through "inspect, plan, build, review, test, ship". That is the Dev Pack's
 * loop, not the board path's, and the buyer here has never written code. It
 * also described a single session, which is no longer what this is.
 */
const WHAT_HAPPENS = [
  {
    icon: Video,
    title: "Your board, not a worked example",
    body: "You build it on your own business, with your own numbers, in the session. Not a demo you watch and adapt later.",
  },
  {
    icon: CalendarClock,
    title: "Two weeks where it runs without you",
    body: "We skip the holiday week on purpose. Your board runs unattended, and we open the next session with what died. Scheduled work does not error when it stops; it just quietly produces nothing.",
  },
  {
    icon: Users,
    title: "Small enough to interrupt",
    body: "You can stop me and ask why. That is the entire reason to be there live rather than read the course.",
  },
];

export default async function BuildLabPage() {
  const { session, seatsLeft, soldOut, open } = await getLabAvailability();

  // Both sources must agree before ANY run detail renders. Gating each line
  // separately let the page show "12 of 12 seats left" directly above "No date
  // set yet" when the row was scheduled but config was not — a state that
  // cannot happen in practice, but the page should not be able to describe a
  // run it is simultaneously denying the existence of.
  const live = BUILD_LAB.status === "scheduled" && session?.status === "scheduled";

  const showDate = live && !!BUILD_LAB.dateDisplay;
  const showSeats = live && seatsLeft !== null && !soldOut;
  const showSoldOut = live && soldOut;

  return (
    <>
      <MarketingNav />

      <Section width="narrow" className="pt-14">
        <p className="text-brand-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          A four-week live AI by Design cohort
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-50 tracking-tight text-balance">
          {BUILD_LAB.name}
        </h1>
        <p className="text-slate-400 mt-4 text-lg leading-relaxed text-pretty">
          {BUILD_LAB.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm">
          <span className="text-slate-50 font-semibold text-2xl">{BUILD_LAB.priceDisplay}</span>
          {/* Renders only from real data: dateDisplay is null until a run is
              scheduled, and seatsLeft is null until a capacity exists. */}
          {showDate ? (
            <span className="text-slate-300">{BUILD_LAB.dateDisplay}</span>
          ) : (
            <span className="text-slate-500">No date set yet</span>
          )}
          {showSeats && (
            <span className="text-brand-400">
              {seatsLeft} of {session?.capacity} seats left
            </span>
          )}
          {showSoldOut && <span className="text-slate-400">Sold out</span>}
        </div>

        <div className="mt-8">
          {/* Unreachable until a run is genuinely scheduled — `open` requires
              config AND the row to agree, with a real date, price, and seat
              left. That is what lets the checkout ship cold: live, testable,
              and unable to take a cent until Terry flips the switch. */}
          {open ? (
            <LabBuyButton className="bg-gold text-slate-50 px-6 py-3 rounded-md hover:bg-gold/90" />
          ) : (
            <>
              <WaitlistForm source="build-lab-page" />
              <p className="text-slate-500 text-xs leading-relaxed mt-3">
                {BUILD_LAB.waitlistNote}
              </p>
            </>
          )}
        </div>
      </Section>

      <Section width="narrow" className="border-t border-slate-800/60 pt-12">
        <h2 className="text-2xl font-bold text-slate-50 tracking-tight mb-8">What happens in the room</h2>
        <div className="space-y-6">
          {WHAT_HAPPENS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <h3 className="text-slate-50 font-semibold text-sm mb-1">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The four dates, rendered from BUILD_LAB.sessions rather than typed
            here, so a date can only ever exist in one place. Shown only when
            the run is genuinely scheduled: while status is 'waitlist' there is
            nothing to show, which is the same rule the date and seat count
            above already follow. */}
        {live && BUILD_LAB.sessions.length > 0 && (
          <div className="mt-12">
            <h3 className="text-slate-50 font-semibold text-sm mb-4">The four sessions</h3>
            <ol className="border border-slate-800 rounded-xl overflow-hidden">
              {BUILD_LAB.sessions.map((s, i) => (
                <li
                  key={s.date}
                  className={`flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-4 ${
                    i > 0 ? "border-t border-slate-800" : ""
                  }`}
                >
                  <span className="text-brand-400 font-mono text-xs shrink-0 w-6">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <time dateTime={s.date} className="text-slate-50 text-sm font-medium w-32 shrink-0">
                    {new Date(s.date + "T12:00:00Z").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })}
                  </time>
                  <span className="text-slate-400 text-sm">{s.focus}</span>
                </li>
              ))}
            </ol>
            <p className="text-slate-500 text-xs leading-relaxed mt-3">
              Thanksgiving week is skipped on purpose. Your board runs unattended
              through it, and session two starts with what that turned up.
            </p>
          </div>
        )}

        {/* How it runs. These are the two things a buyer at this price will ask
            before they ask anything else, and both are commitments rather than
            features: the bundle is what makes the pre-work gate enforceable,
            and the recording line is a privacy promise we have to keep in the
            room. Both render from config so the run book and the sales page
            cannot drift. */}
        <div className="mt-12">
          <h3 className="text-slate-50 font-semibold text-sm mb-4">How it runs</h3>
          <ul className="space-y-3">
            {(getRung("build-lab")?.includes ?? []).map((item) => (
              <li key={item} className="flex gap-3 text-slate-400 text-sm leading-relaxed">
                <span className="text-brand-400 shrink-0" aria-hidden="true">
                  &rarr;
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-slate-500 text-xs leading-relaxed mt-4">
            {BUILD_LAB.recordingPolicy}
          </p>
        </div>

        <div className="mt-10 rounded-xl border-l-2 border-gold bg-gold/[0.06] border-y border-r border-slate-800 px-6 py-5">
          <p className="text-slate-300 text-sm leading-relaxed">
            <span className="text-slate-50 font-medium">You don&rsquo;t need this to finish the course.</span>{" "}
            The {BRAND.name} course is self-paced, complete on its own, and costs a
            fraction of this. The Lab is for people who want to watch the decisions
            get made in real time and ask about their own situation while it happens.
          </p>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}
