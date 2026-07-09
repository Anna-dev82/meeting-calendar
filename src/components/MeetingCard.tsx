import type { Employee, Meeting } from "../lib/types";
import { formatEmployeeWithRole } from "../lib/employeeLabel";
import { getMeetingPriorityOption, OVERDUE_STYLE } from "../lib/meetingColors";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import React from "react";
import { toDateTime } from "../lib/date";

export function MeetingCard({
  meeting,
  employeesById,
  onDelete,
  onEdit,
  compact = false,
  onOpen,
}: {
  meeting: Meeting;
  employeesById: Map<string, Employee>;
  onDelete: (meetingId: string) => void;
  onEdit?: (meeting: Meeting) => void;
  compact?: boolean;
  onOpen?: (meeting: Meeting) => void;
}) {
  const participants = meeting.participantIds
    .map((id) => employeesById.get(id))
    .filter(Boolean) as Employee[];

  const now = new Date();
  const isOverdue = toDateTime(meeting.date, meeting.endTime).getTime() <= now.getTime();
  const strip = isOverdue ? OVERDUE_STYLE : getMeetingPriorityOption(meeting.priority);

  const participantNames =
    participants.length > 0
      ? participants.map((e) => formatEmployeeWithRole(e)).join("; ")
      : "Без участников";

  const openable = Boolean(onOpen);
  const editable = Boolean(onEdit);

  function handleCardClick() {
    if (onOpen) onOpen(meeting);
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition",
        openable && "cursor-pointer hover:ring-2 hover:ring-blue-400/40",
      )}
      onClick={openable ? handleCardClick : undefined}
      onKeyDown={
        openable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick();
              }
            }
          : undefined
      }
      role={openable ? "button" : undefined}
      tabIndex={openable ? 0 : undefined}
    >
      <div className="flex">
        <div
          className={cn("w-2 shrink-0", strip.className)}
          title={`${isOverdue ? "Статус" : "Важность"}: ${strip.label}`}
        />
        <div className="flex flex-1 flex-col p-4 gap-2 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {meeting.startTime} - {meeting.endTime}
              </div>
              <div className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {strip.label}
              </div>
              <div
                className={cn(
                  "mt-1 font-semibold text-slate-900 dark:text-slate-50 break-words",
                  compact && "line-clamp-2",
                )}
              >
                {meeting.title}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
              {editable ? (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(meeting);
                  }}
                >
                  Изменить
                </Button>
              ) : null}
              <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const ok = window.confirm("Удалить встречу?");
                if (ok) onDelete(meeting.id);
              }}
            >
              Удалить
            </Button>
            </div>
          </div>

          <div
            className={cn(
              "text-sm text-slate-700 dark:text-slate-200",
              compact && "line-clamp-2",
            )}
          >
            <span className="font-medium text-slate-800 dark:text-slate-100">Участники:</span>{" "}
            {participantNames}
          </div>

          {!compact && meeting.description ? (
            <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-200 break-words whitespace-pre-wrap">
              {meeting.description}
            </div>
          ) : null}

          {!compact && meeting.joinLink ? (
            <div className="text-sm text-slate-700 dark:text-slate-200 break-all">
              <span className="font-medium text-slate-800 dark:text-slate-100">Ссылка:</span>{" "}
              <a
                className="text-blue-600 hover:underline dark:text-blue-400"
                href={meeting.joinLink}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {meeting.joinLink}
              </a>
            </div>
          ) : null}

          {compact ? (
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">Нажмите, чтобы открыть полностью →</div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
