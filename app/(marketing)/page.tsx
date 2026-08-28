import { Suspense } from "react";
import { getAllModules } from "@/lib/content";
import { TEMPLATES } from "@/lib/course-config";
import UpgradeScroller from "@/components/marketing/UpgradeScroller";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Hero from "@/components/marketing/Hero";
import TracksSection from "@/components/marketing/TracksSection";
import MaintenanceSection from "@/components/marketing/MaintenanceSection";
import CoreLoopSection from "@/components/marketing/CoreLoopSection";
import OutcomesSection from "@/components/marketing/OutcomesSection";
import CurriculumSection from "@/components/marketing/CurriculumSection";
import AudienceSection from "@/components/marketing/AudienceSection";
import BuildLabSection from "@/components/marketing/BuildLabSection";
import PricingSection from "@/components/marketing/PricingSection";
import FaqSection from "@/components/marketing/FaqSection";

export default function LandingPage() {
  // BOARD ONLY. The landing page sells the board course, so it must advertise
  // what a buyer actually receives. Unfiltered this reads 64 lessons across 13
  // modules, most of which sit behind the Dev Pack — a number that is true about
  // the repository and false about the purchase.
  const modules = getAllModules("board");
  const lessonCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Suspense fallback={null}>
        <UpgradeScroller />
      </Suspense>

      <MarketingNav />

      <main>
        <Hero
          moduleCount={modules.length}
          lessonCount={lessonCount}
          // Board buyers are not promised the Dev Pack downloads.
          templateCount={TEMPLATES.filter((t) => !t.devPackOnly).length}
        />
        <CoreLoopSection />
        <TracksSection />

        <OutcomesSection />
        <CurriculumSection modules={modules} />
        <AudienceSection />
        {/* Directly before pricing: it is the last objection a buyer has, and
            answering it with a checkable date beats answering it with copy. */}
        <MaintenanceSection />
        <BuildLabSection />
        <PricingSection />
        <FaqSection />
      </main>

      <MarketingFooter />
    </div>
  );
}
