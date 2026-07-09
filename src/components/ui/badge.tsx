import React from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "destructive";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/70 dark:bg-slate-800/60 dark:text-slate-100 dark:ring-slate-700",
  destructive:
    "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-500/30",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

