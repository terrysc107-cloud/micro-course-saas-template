import { Check, Lock } from "lucide-react";
import { PRODUCT, INCLUDED, PARENT_BRAND } from "@/lib/course-config";
import BuyButton from "./BuyButton";
import Section from "./Section";

export default function PricingSection() {
  return (
    <Section
      id="pricing"
      width="narrow"
      eyebrow="Pricing"
      title="One price. Everything included."
      subtitle="No tiers, no upsell, no subscription."
      className="border-b border-slate-800/60"
    >
      <div className="bg-slate-900/70 border border-brand-600/40 rounded-2xl p-7 sm:p-9">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
            {PRODUCT.priceDisplay}
          </span>
          <span className="text-slate-400">one-time</span>
        </div>
        <p className="text-slate-500 text-sm mb-7">{PRODUCT.priceNote}</p>

        <ul className="space-y-3 mb-8">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
              <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <BuyButton
          label={PRODUCT.ctaLabel}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-xl text-lg shadow-lg shadow-brand-950/50"
        >
          <Lock className="w-4 h-4" />
        </BuyButton>

        <p className="text-slate-500 text-xs mt-4 text-center">
          Secure checkout by Stripe · 14-day refund, just email us
        </p>
      </div>

      <p className="text-slate-500 text-sm leading-relaxed mt-8 text-pretty">
        {PARENT_BRAND.blurb}
      </p>
    </Section>
  );
}
