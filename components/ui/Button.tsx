import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand-600 hover:bg-brand-700 text-white": variant === "primary",
            "bg-slate-800 hover:bg-slate-700 text-white": variant === "secondary",
            "hover:bg-slate-800 text-slate-300 hover:text-white": variant === "ghost",
            "border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white": variant === "outline",
          },
          {
            "px-3 py-1.5 text-xs": size === "sm",
            "px-4 py-2.5 text-sm": size === "md",
            "px-6 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
