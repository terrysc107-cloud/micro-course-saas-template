import Link from "next/link";
import { BRAND, PARENT_BRAND, DISCLAIMER, DOCS_NOTE, LAST_VERIFIED } from "@/lib/course-config";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-800 mt-8">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/aix-mark.svg"
              alt=""
              aria-hidden="true"
              className="w-8 h-8 shrink-0"
            />
            <div>
              <p className="text-slate-50 font-semibold text-sm">{BRAND.name}</p>
              <p className="text-slate-500 text-xs">{BRAND.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link href="#curriculum" className="text-slate-400 hover:text-slate-50 transition-colors">
              Curriculum
            </Link>
            <Link href="#faq" className="text-slate-400 hover:text-slate-50 transition-colors">
              FAQ
            </Link>
            <a
              href={PARENT_BRAND.url}
              className="text-slate-400 hover:text-slate-50 transition-colors"
            >
              {PARENT_BRAND.name}
            </a>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="text-slate-400 hover:text-slate-50 transition-colors"
            >
              Support
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800/70 pt-6 space-y-2">
          <p className="text-slate-400 text-sm font-medium">{DISCLAIMER}</p>
          <p className="text-slate-500 text-xs leading-relaxed max-w-3xl">
            &ldquo;Claude&rdquo; and &ldquo;Claude Code&rdquo; are products of Anthropic. This
            course teaches you how to use them and is not a substitute for the{" "}
            <a href={DOCS_NOTE.url} className="text-slate-400 hover:text-slate-50 underline">
              official documentation
            </a>
            . Lesson facts last verified {LAST_VERIFIED}.
          </p>
          <p className="text-slate-500 text-xs pt-2">
            © {new Date().getFullYear()} {PARENT_BRAND.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
