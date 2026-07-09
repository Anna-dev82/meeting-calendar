import React, { createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { Button } from "./button";

type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({
  className,
  children,
  showClose = true
}: {
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("DialogContent must be used within Dialog");
  const { open, onOpenChange } = ctx;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        className="absolute inset-0 z-0 bg-slate-900/50"
        aria-label="Закрыть"
        onClick={() => onOpenChange(false)}
        type="button"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.15)] ring-1 ring-slate-200/60 dark:ring-slate-800/70",
          className,
        )}
      >
        {showClose ? (
          <div className="absolute right-3 top-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              type="button"
            >
              ✕
            </Button>
          </div>
        ) : null}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-semibold text-slate-900 dark:text-slate-50", className)} {...props} />
  );
}

