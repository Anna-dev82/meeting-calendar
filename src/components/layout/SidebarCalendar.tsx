import React, { useMemo, useState } from "react";
import { addMonths, formatISODate, getCalendarMonthDays, parseISODate } from "../../lib/date";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const WEEKDAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function SidebarCalendar({
  selectedDateISO,
  onSelectDate,
  datesWithMeetings,
}: {
  selectedDateISO: string;
  onSelectDate: (iso: string) => void;
  datesWithMeetings: Set<string>;
}) {
  const selectedDate = parseISODate(selectedDateISO);
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const monthDays = useMemo(() => getCalendarMonthDays(viewMonth), [viewMonth]);
  const monthTitle = viewMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  const todayISO = formatISODate(new Date());

  return (
    <div className="rounded-2xl bg-white/70 dark:bg-slate-900/60 ring-1 ring-slate-200/70 dark:ring-slate-800/70 p-4 sticky top-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          aria-label="Предыдущий месяц"
        >
          ‹
        </Button>
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-50 capitalize text-center min-w-0 truncate">
          {monthTitle}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          aria-label="Следующий месяц"
        >
          ›
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-[10px] font-medium text-slate-500 dark:text-slate-400 py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(({ dateISO, inMonth }) => {
          const hasMeetings = datesWithMeetings.has(dateISO);
          const isSelected = dateISO === selectedDateISO;
          const isToday = dateISO === todayISO;
          const dayNum = parseISODate(dateISO).getDate();

          return (
            <button
              key={dateISO}
              type="button"
              onClick={() => onSelectDate(dateISO)}
              className={cn(
                "relative flex h-9 w-full flex-col items-center justify-center rounded-lg text-xs transition",
                inMonth
                  ? "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  : "text-slate-400 dark:text-slate-600",
                isSelected && "bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-600",
                isToday && !isSelected && "ring-1 ring-blue-400/60",
              )}
            >
              {dayNum}
              {hasMeetings && inMonth ? (
                <span
                  className={cn(
                    "absolute bottom-0.5 h-1 w-1 rounded-full",
                    isSelected ? "bg-white" : "bg-blue-500",
                  )}
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
        Точка под датой — есть встречи. Нажмите на день, чтобы открыть его в календаре.
      </p>
    </div>
  );
}
