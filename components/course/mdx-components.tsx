import { Lightbulb, AlertTriangle, Info, CheckCircle2, Zap } from "lucide-react";
import type { ReactNode } from "react";

// ── Callout ──────────────────────────────────────────────────────────────────
type CalloutType = "tip" | "warning" | "info" | "success";

const CALLOUT_CONFIG: Record<
  CalloutType,
  { icon: React.ElementType; iconColor: string; borderColor: string; bgColor: string; titleColor: string; defaultTitle: string }
> = {
  tip: {
    icon: Lightbulb,
    iconColor: "text-brand-400",
    borderColor: "border-brand-500",
    bgColor: "bg-brand-950/30",
    titleColor: "text-brand-400",
    defaultTitle: "Pro Tip",
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-400",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-950/30",
    titleColor: "text-amber-400",
    defaultTitle: "Watch Out",
  },
  info: {
    icon: Info,
    iconColor: "text-slate-400",
    borderColor: "border-slate-500",
    bgColor: "bg-slate-800/50",
    titleColor: "text-slate-400",
    defaultTitle: "Note",
  },
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-950/30",
    titleColor: "text-emerald-400",
    defaultTitle: "Good to Know",
  },
};

interface CalloutProps {
  type: CalloutType;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const { icon: Icon, iconColor, borderColor, bgColor, titleColor, defaultTitle } = CALLOUT_CONFIG[type];
  return (
    <div className={`not-prose my-6 rounded-xl border-l-4 ${borderColor} ${bgColor} px-5 py-4`}>
      <div className={`flex items-center gap-2 mb-2`}>
        <Icon className={`w-4 h-4 ${iconColor} shrink-0`} />
        <span className={`text-sm font-semibold ${titleColor}`}>{title ?? defaultTitle}</span>
      </div>
      <div className="text-sm text-slate-300 leading-relaxed space-y-1">
        {children}
      </div>
    </div>
  );
}

// ── LessonImage ───────────────────────────────────────────────────────────────
interface LessonImageProps {
  src: string;
  alt: string;
  caption?: string;
}

export function LessonImage({ src, alt, caption }: LessonImageProps) {
  return (
    <figure className="not-prose my-8">
      <div className="rounded-xl overflow-hidden border border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} loading="lazy" className="w-full h-auto block" />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-slate-500 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── KeyPoint ─────────────────────────────────────────────────────────────────
interface KeyPointProps {
  children: ReactNode;
}

export function KeyPoint({ children }: KeyPointProps) {
  return (
    <div className="not-prose my-8 rounded-xl bg-gradient-to-r from-brand-950/40 to-slate-900 border border-brand-800/50 px-6 py-5">
      <div className="flex items-start gap-3">
        <Zap className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
        <p className="text-brand-100 font-medium leading-relaxed text-sm">{children}</p>
      </div>
    </div>
  );
}

// ── Export map for MDXRemote ──────────────────────────────────────────────────
export const mdxComponents = {
  Callout,
  LessonImage,
  KeyPoint,
};
