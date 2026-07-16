import Link from "next/link";
import { Terminal } from "lucide-react";
import { BRAND, PRODUCT } from "@/lib/course-config";
import BuyButton from "./BuyButton";

export default function MarketingNav() {
  return (
    <nav className="border-b border-slate-800/60 sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-500/30 flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4 text-brand-400" />
          </div>
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
            className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 sm:px-4 py-2 rounded-lg text-sm"
          />
        </div>
      </div>
    </nav>
  );
}
