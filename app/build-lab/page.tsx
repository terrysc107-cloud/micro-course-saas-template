import type { Metadata } from "next";
import { CalendarClock, Users, Video } from "lucide-react";
import { BUILD_LAB, BRAND, DISCLAIMER } from "@/lib/course-config";
import { getLabAvailability } from "@/lib/build-lab";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Section from "@/components/marketing/Section";
import WaitlistForm from "@/components/marketing/WaitlistForm";
import LabBuyButton from "@/components/marketing/LabBuyButton";

export const metadata: Metadata = {
  title: `${BUILD_LAB.name} — ${BRAND.name}`,
  description:
    "A live, small-group session where we build one real feature end to end and you watch every decision, including the ones that go wrong. " +
    DISCLAIMER,
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

const WHAT_HAPPENS = [
  {
    icon: Video,
    title: "One real feature, start to finish",
    body: "Not a demo repo. We take a real requirement and go through the whole loop — inspect, plan, build, review, test, ship — live.",
  },
  {
    icon: Users,
    title: "Small enough to interrupt",
    body: "You can stop me and ask why. That is the entire reason to attend live rather than read the course.",
  },
  {
    icon: CalendarClock,
    title: "Including the parts that go wrong",
    body: "The decisions that don't work out are the ones you can't get from documentation. Those stay in.",
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
          A live AI by Design session
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
