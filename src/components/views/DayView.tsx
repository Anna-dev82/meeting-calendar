import type { Employee, Meeting } from "../../lib/types";
import { MeetingCard } from "../MeetingCard";
import React from "react";

export function DayView({
  dateISO,
  meetings,
  employeesById,
  onDeleteMeeting,
  onEditMeeting,
  canEditMeeting,
  onOpenMeeting,
}: {
  dateISO: string;
  meetings: Meeting[];
  employeesById: Map<string, Employee>;
  onDeleteMeeting: (meetingId: string) => void;
  onEditMeeting: (meeting: Meeting) => void;
  canEditMeeting: (meeting: Meeting) => boolean;
  onOpenMeeting: (meeting: Meeting) => void;
}) {
  return (
    <div className="space-y-3">
      {meetings.length === 0 ? (
        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/40 ring-1 ring-slate-200/70 dark:ring-slate-800/70 p-6 text-sm text-slate-600 dark:text-slate-300">
          На {dateISO} встреч нет.
        </div>
      ) : null}
      <div className="space-y-3">
        {meetings.map((m) => (
          <MeetingCard
            key={m.id}
            meeting={m}
            employeesById={employeesById}
            onDelete={onDeleteMeeting}
            onEdit={canEditMeeting(m) ? onEditMeeting : undefined}
            onOpen={onOpenMeeting}
          />
        ))}
      </div>
    </div>
  );
}

