import type { Employee, Meeting } from "../../lib/types";
import { MeetingCard } from "../MeetingCard";
import React from "react";
import { formatISODate, parseISODate } from "../../lib/date";

export function WeekView({
  weekDaysISO,
  meetingsByDayISO,
  employeesById,
  onDeleteMeeting,
  onOpenMeeting,
  onEditMeeting,
  canEditMeeting,
  now,
}: {
  weekDaysISO: string[];
  meetingsByDayISO: Record<string, Meeting[]>;
  employeesById: Map<string, Employee>;
  onDeleteMeeting: (meetingId: string) => void;
  onOpenMeeting: (meeting: Meeting) => void;
  onEditMeeting: (meeting: Meeting) => void;
  canEditMeeting: (meeting: Meeting) => boolean;
  now: Date;
}) {  const todayISO = formatISODate(now);

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-7 sm:grid-cols-2 md:grid-cols-3">
      {weekDaysISO.map((dateISO) => {
        const d = parseISODate(dateISO);
        const weekday = d.toLocaleDateString("ru-RU", { weekday: "short" });
        const dayNum = d.toLocaleDateString("ru-RU", { day: "2-digit" });
        const isToday = dateISO === todayISO;
        const meetings = meetingsByDayISO[dateISO] ?? [];

        return (
          <div key={dateISO} className="space-y-3 min-w-0">
            <div
              className={[
                "rounded-2xl p-3 ring-1",
                isToday
                  ? "bg-blue-500/10 ring-blue-500/25 text-slate-900 dark:text-slate-50"
                  : "bg-white/50 ring-slate-200/70 dark:bg-slate-900/40 dark:ring-slate-800/70 text-slate-700 dark:text-slate-200"
              ].join(" ")}
            >
              <div className="text-sm font-semibold">
                {weekday} {dayNum}
              </div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {meetings.length} {meetings.length === 1 ? "встреча" : "встречи"}
              </div>
            </div>

            <div className="space-y-3">
              {meetings.length === 0 ? null : (
                <>
                  {meetings.map((m) => (
                    <MeetingCard
                      key={m.id}
                      meeting={m}
                      employeesById={employeesById}
                      onDelete={onDeleteMeeting}
                      onEdit={canEditMeeting(m) ? onEditMeeting : undefined}
                      compact
                      onOpen={onOpenMeeting}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

