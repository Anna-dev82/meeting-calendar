import React from "react";
import { cn } from "../../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "form-control h-11 w-full rounded-2xl px-4 text-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-blue-400 dark:ring-slate-700",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

