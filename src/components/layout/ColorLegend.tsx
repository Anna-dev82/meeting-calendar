import React from "react";
import { MEETING_PRIORITIES, OVERDUE_STYLE } from "../../lib/meetingColors";
import { cn } from "../../lib/utils";

export function ColorLegend() {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-900/50 ring-1 ring-slate-200/70 dark:ring-slate-800/70 px-4 py-3">
      <p className="text-sm text-slate-700 dark:text-slate-200">
        <span className="font-semibold text-slate-900 dark:text-slate-50">Цвет полоски</span> — важность
        встречи. Выбирается при создании или редактировании.
      </p>
      <ul className="mt-3 space-y-2">
        {MEETING_PRIORITIES.map((p) => (
          <li key={p.id} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span className={cn("mt-0.5 h-3 w-3 shrink-0 rounded-full", p.className)} aria-hidden />
            <span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{p.label}</span>
              {" — "}
              {p.description}
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <span className={cn("mt-0.5 h-3 w-3 shrink-0 rounded-full", OVERDUE_STYLE.className)} aria-hidden />
          <span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{OVERDUE_STYLE.label}</span>
            {" — "}
            {OVERDUE_STYLE.description}
          </span>
        </li>
      </ul>
    </div>
  );
}
