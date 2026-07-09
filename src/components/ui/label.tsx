import React from "react";
import { cn } from "../../lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-sm font-semibold text-slate-800 dark:text-slate-200", className)}
      {...props}
    />
  );
}

