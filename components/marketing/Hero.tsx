import Link from "next/link";
import { BookOpen, Layers, FileDown } from "lucide-react";
import { PARENT_BRAND, PRODUCT, CORE_LOOP, LAST_VERIFIED } from "@/lib/course-config";
import BuyButton from "./BuyButton";

interface HeroProps {
  moduleCount: number;
  lessonCount: number;
  templateCount: number;
}

/** Stats are counted from the filesystem by the page, never hardcoded — a
 *  wrong number here is a trust problem, not a copy problem. */
export default function Hero({ moduleCount, lessonCount, templateCount }: HeroProps) {
  const stats = [
    { icon: Layers, val: String(moduleCount), label: "Modules" },
    { icon: BookOpen, val: String(lessonCount), label: "Lessons" },
    { icon: FileDown, val: String(templateCount), label: "Templates" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-slate-800/60">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[70rem] h-[40rem] rounded-full bg-brand-600/10 blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div className="max-w-3xl">
          <a
            href={PARENT_BRAND.url}
            className="inline-flex items-center gap-2 bg-slate-900/80 text-slate-300 text-xs sm:text-sm px-3.5 py-1.5 rounded-full border border-slate-700/70 mb-7 hover:border-slate-600 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            An {PARENT_BRAND.name} course
          </a>

          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-6 text-balance">
            Ship real features with Claude Code —{" "}
            <span className="text-brand-400">and stand behind every diff.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-8 text-pretty">
            Most people use Claude Code like a slot machine: prompt, hope, paste. This course
            teaches the workflow professionals actually use — inspect, plan, build, review, test,
            ship — so the code you produce is code you can defend in review.
          </p>

          {/* The core loop, stated up front — it's the spine of the whole course */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mb-9">
            {CORE_LOOP.map(({ step }, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                  {step}
                </span>
                {i < CORE_LOOP.length - 1 && <span className="text-slate-700">→</span>}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <BuyButton
              label={PRODUCT.ctaLabel}
              showChevron
              className="bg-gold hover:bg-brand-400 text-background px-7 py-4 rounded-xl text-base sm:text-lg shadow-[0_0_28px_rgba(201,168,76,0.28)] hover:shadow-[0_0_36px_rgba(201,168,76,0.42)] transition-shadow"
            />
            <Link
              href="#curriculum"
              className="inline-flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-500 hover:bg-slate-900/50 text-slate-300 hover:text-white px-7 py-4 rounded-xl text-base sm:text-lg font-semibold transition-colors"
            >
              See the curriculum
            </Link>
          </div>

          <p className="text-slate-500 text-sm mt-4">
            {PRODUCT.priceNote} Verified against the official docs on {LAST_VERIFIED}.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mt-14">
          {stats.map(({ icon: Icon, val, label }) => (
            <div
              key={label}
              className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 backdrop-blur"
            >
              <Icon className="w-4 h-4 text-brand-400 mb-2" />
              <p className="text-2xl font-bold text-white tabular-nums">{val}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
