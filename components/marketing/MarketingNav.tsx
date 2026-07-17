import Link from "next/link";
import { BRAND, PRODUCT } from "@/lib/course-config";
import BuyButton from "./BuyButton";

export default function MarketingNav() {
  // Backdrop matches by-design-ai's Header: same translucency, same gold hairline.
  return (
    <nav className="border-b border-gold/15 sticky top-0 z-20 bg-background/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          {/* The aix mark, not the full aixdesign lockup. The product here is
              Claude Code Class; AI by Design is the parent that endorses it
              (BRAND.tagline, below). Using the lockup as the primary logo would
              make this site read as aixdesign.dev itself.
              The SVG embeds Geist outlines (~62KB) — render as <img>, never inline. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/aix-mark.svg"
            alt=""
            aria-hidden="true"
            className="w-8 h-8 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm leading-tight truncate">{BRAND.name}</p>
            <p className="text-slate-500 text-[11px] leading-tight truncate">{BRAND.tagline}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="#curriculum"
            className="hidden sm:block text-slate-400 hover:text-white text-sm transition-colors"
          >
            Curriculum
          </Link>
          <Link
            href="#pricing"
            className="hidden sm:block text-slate-400 hover:text-white text-sm transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/sign-in"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Sign in
          </Link>
          <BuyButton
            label={PRODUCT.priceDisplay}
            className="bg-gold hover:bg-brand-400 text-background px-3.5 sm:px-4 py-2 rounded-lg text-sm"
          />
        </div>
      </div>
    </nav>
  );
}
