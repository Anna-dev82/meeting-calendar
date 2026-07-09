import React from "react";
import { cn } from "../../lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/70 dark:bg-slate-900/60 ring-1 ring-slate-200/70 dark:ring-slate-800/70 shadow-[0_10px_30px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  );
}

