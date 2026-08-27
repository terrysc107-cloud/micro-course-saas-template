import { Suspense } from "react";
import { getAllModules } from "@/lib/content";
import { TEMPLATES } from "@/lib/course-config";
import UpgradeScroller from "@/components/marketing/UpgradeScroller";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import Hero from "@/components/marketing/Hero";
import TracksSection from "@/components/marketing/TracksSection";
import CoreLoopSection from "@/components/marketing/CoreLoopSection";
import OutcomesSection from "@/components/marketing/OutcomesSection";
import CurriculumSection from "@/components/marketing/CurriculumSection";
import AudienceSection from "@/components/marketing/AudienceSection";
import BuildLabSection from "@/components/marketing/BuildLabSection";
import PricingSection from "@/components/marketing/PricingSection";
import FaqSection from "@/components/marketing/FaqSection";

export default function LandingPage() {
  const modules = getAllModules();
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
          templateCount={TEMPLATES.length}
        />
        <CoreLoopSection />
        <TracksSection />

        <OutcomesSection />
        <CurriculumSection modules={modules} />
        <AudienceSection />
        <BuildLabSection />
        <PricingSection />
        <FaqSection />
      </main>

      <MarketingFooter />
    </div>
  );
}
