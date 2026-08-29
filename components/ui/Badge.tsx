import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "locked";
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-slate-800 text-slate-300": variant === "default",
          "bg-green-100 text-green-700": variant === "success",
          // amber-500 not -400: see mdx-components.tsx — 400 collides with gold.
          "bg-amber-100 text-amber-800": variant === "warning",
          "bg-brand-900/40 text-brand-400": variant === "info",
          "bg-slate-800/60 text-slate-500": variant === "locked",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
