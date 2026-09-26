import Link from "next/link";
import { BRAND, PRODUCT } from "@/lib/course-config";
import BuyButton from "./BuyButton";

export default function MarketingNav() {
  // Backdrop matches by-design-ai's Header: same translucency, same gold hairline.
  return (
    <nav className="border-b border-gold/15 sticky top-0 z-20 bg-background/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          {/* The product's own mark. Was the AI by Design aix-mark, which made
              this site read as the parent brand rather than the product.
              Four seats, three filled and one open: you assemble a board one
              seat at a time, and the course ships you one working seat. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/board-mark.svg"
            alt=""
            aria-hidden="true"
            className="w-8 h-8 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-50 text-sm leading-tight truncate">{BRAND.name}</p>
            <p className="text-slate-500 text-[11px] leading-tight truncate">{BRAND.tagline}</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Absolute, not bare "#curriculum". These render on /ladder,
              /proof and /build-lab too, where a bare hash scrolls nowhere. */}
          <Link
            href="/build-lab"
            className="hidden sm:block text-slate-400 hover:text-slate-50 text-sm transition-colors"
          >
            Build Labs
          </Link>
          <Link
            href="/proof"
            className="hidden md:block text-slate-400 hover:text-slate-50 text-sm transition-colors"
          >
            Numbers
          </Link>
          <Link
            href="/#pricing"
            className="hidden sm:block text-slate-400 hover:text-slate-50 text-sm transition-colors"
          >
            Pricing
          </Link>
          <a
            href="https://aixdesign.dev/guide"
            className="hidden lg:block text-slate-400 hover:text-slate-50 text-sm transition-colors"
          >
            Free guide
          </a>
          <a
            href="https://aixdesign.dev/education"
            className="hidden lg:block text-slate-400 hover:text-slate-50 text-sm transition-colors"
          >
            AI by Design
          </a>
          <Link
            href="/sign-in"
            className="text-slate-400 hover:text-slate-50 text-sm transition-colors"
          >
            Sign in
          </Link>
          <BuyButton
            label={PRODUCT.priceDisplay}
            className="bg-gold hover:brightness-95 text-slate-50 px-3.5 sm:px-4 py-2 rounded-lg text-sm"
          />
        </div>
      </div>
    </nav>
  );
}
