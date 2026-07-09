import React from "react";
import { cn } from "../../lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "form-control min-h-[120px] w-full resize-y rounded-2xl px-4 py-3 text-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-blue-400 dark:ring-slate-700",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

