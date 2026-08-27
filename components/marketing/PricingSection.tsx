import { Check, Lock } from "lucide-react";
import { PRODUCT, INCLUDED, PARENT_BRAND, BUILD_LAB } from "@/lib/course-config";
import BuyButton from "./BuyButton";
import Section from "./Section";

/**
 * This section used to promise "No tiers, no upsell, no subscription." Once the
 * Build Lab has a checkout, that sentence is false — and deleting the word
 * "upsell" would not fix it, because the sentence's whole job was to promise
 * something we stopped doing. It says the new true thing instead: the course is
 * one price and complete on its own, and the Lab is a separate product nobody
 * needs in order to finish. Worth keeping honest — it is the reason someone
 * trusts this page.
 */
export default function PricingSection() {
  return (
    <Section
      id="pricing"
      width="narrow"
      eyebrow="Pricing"
      title="One price. The whole course."
      subtitle="No tiers, no subscription, nothing held back for a higher tier. There is one other thing we sell, the live Build Lab, and the course is complete without it."
      className="border-b border-slate-800/60"
    >
      <div className="bg-slate-900/70 border border-brand-600/40 rounded-2xl p-7 sm:p-9">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl sm:text-6xl font-bold text-slate-50 tracking-tight">
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
          className="w-full bg-gold hover:brightness-95 text-slate-50 py-4 rounded-xl text-lg shadow-[0_0_28px_rgba(201,168,76,0.28)] hover:shadow-[0_0_36px_rgba(201,168,76,0.42)] transition-shadow"
        >
          <Lock className="w-4 h-4" />
        </BuyButton>

        <p className="text-slate-500 text-xs mt-4 text-center">
          Secure checkout by Stripe · 14-day refund, just email us
        </p>
        <p className="text-slate-500 text-xs mt-2 text-center">
          {BUILD_LAB.name} is sold separately and is not required for anything in
          the course.
        </p>
      </div>

      <p className="text-slate-500 text-sm leading-relaxed mt-8 text-pretty">
        {PARENT_BRAND.blurb}
      </p>
    </Section>
  );
}
