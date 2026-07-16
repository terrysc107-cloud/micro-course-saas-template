import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  width?: "default" | "narrow";
  children: React.ReactNode;
}

/** Shared spacing/heading shell so every marketing section lines up. */
export default function Section({
  id,
  eyebrow,
  title,
  subtitle,
  className,
  width = "default",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto px-6 py-16 sm:py-20",
        width === "narrow" ? "max-w-3xl" : "max-w-6xl",
        className
      )}
    >
      {(eyebrow || title) && (
        <div className="mb-10 sm:mb-12">
          {eyebrow && (
            <p className="text-brand-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-slate-400 mt-3 max-w-2xl leading-relaxed text-pretty">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
