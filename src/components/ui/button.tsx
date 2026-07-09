import React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const styles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:opacity-70",
  secondary:
    "bg-white/70 text-slate-900 ring-1 ring-slate-200/70 hover:bg-white dark:bg-slate-900/60 dark:text-slate-50 dark:ring-slate-800/70 dark:hover:bg-slate-900/80 disabled:opacity-50",
  danger:
    "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 disabled:bg-rose-400",
  ghost:
    "bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-50 dark:hover:bg-slate-800/60 disabled:opacity-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-sm rounded-2xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors",
        styles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}

