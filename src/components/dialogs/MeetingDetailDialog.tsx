import React from "react";
import type { Employee, Meeting } from "../../lib/types";
import { formatEmployeeWithRole } from "../../lib/employeeLabel";
import { getMeetingPriorityOption, OVERDUE_STYLE } from "../../lib/meetingColors";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { toDateTime } from "../../lib/date";

export function MeetingDetailDialog({
  meeting,
  employeesById,
  currentUserId,
  open,
  onOpenChange,
  onDelete,
  onEdit,
  onAccept,
}: {
  meeting: Meeting | null;
  employeesById: Map<string, Employee>;
  currentUserId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (meetingId: string) => void;
  onEdit: (meeting: Meeting) => void;
  onAccept: (meetingId: string) => void;
}) {
  if (!meeting) return null;

  const now = new Date();
  const isOverdue = toDateTime(meeting.date, meeting.endTime).getTime() <= now.getTime();
  const strip = isOverdue ? OVERDUE_STYLE : getMeetingPriorityOption(meeting.priority);
  const canEdit = Boolean(currentUserId && meeting.createdByEmployeeId === currentUserId);
  const canAccept = Boolean(
    currentUserId &&
      meeting.participantIds.includes(currentUserId) &&
      meeting.createdByEmployeeId !== currentUserId,
  );
  const accepted = Boolean(currentUserId && meeting.acceptedByEmployeeIds.includes(currentUserId));
  const participants = meeting.participantIds
    .map((id) => employeesById.get(id))
    .filter(Boolean) as Employee[];

  const acceptedEmployees = meeting.acceptedByEmployeeIds
    .map((id) => employeesById.get(id))
    .filter(Boolean) as Employee[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" showClose>
        <DialogHeader>
          <DialogTitle>Встреча</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className={cn("w-2 shrink-0 rounded-full", strip.className)} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                {meeting.date} · {meeting.startTime}–{meeting.endTime}
              </div>
              <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50 break-words">
                {meeting.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                {isOverdue ? "Статус:" : "Важность:"} {strip.label}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{strip.description}</p>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Участники</div>
            {participants.length === 0 ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Без участников</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                {participants.map((e) => (
                  <li key={e.id}>{formatEmployeeWithRole(e)}</li>
                ))}
              </ul>
            )}
          </div>

          {canEdit ? (
            <div className="rounded-2xl bg-white/60 dark:bg-slate-900/40 ring-1 ring-slate-200/70 dark:ring-slate-800/70 p-4">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Приняли приглашение ({acceptedEmployees.length})
              </div>
              {acceptedEmployees.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Пока никто не отметил «Принято».
                </p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                  {acceptedEmployees.map((e) => (
                    <li key={e.id}>{formatEmployeeWithRole(e)}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Описание</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
              {meeting.description || "Описание не указано"}
            </p>
          </div>

          {meeting.joinLink ? (
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Ссылка на встречу</div>
              <a
                className="mt-2 block break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
                href={meeting.joinLink}
                target="_blank"
                rel="noreferrer"
              >
                {meeting.joinLink}
              </a>
            </div>
          ) : null}

          {meeting.materials ? (
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">Материалы</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words">
                {meeting.materials}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Закрыть
            </Button>
            {!currentUserId ? (
              <div className="w-full text-xs text-slate-500 dark:text-slate-400 text-right">
                Выберите пользователя в шапке, чтобы поставить «Принято».
              </div>
            ) : null}
            {canAccept ? (
              <Button
                type="button"
                variant={accepted ? "secondary" : "primary"}
                onClick={() => onAccept(meeting.id)}
                title={accepted ? "Вы уже приняли участие" : "Отметить как принято"}
              >
                {accepted ? "Принято" : "Принять"}
              </Button>
            ) : null}

            {canEdit ? (
              <>
                <Button
                  type="button"
                  onClick={() => {
                    onEdit(meeting);
                    onOpenChange(false);
                  }}
                >
                  Редактировать
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => {
                    const ok = window.confirm("Удалить встречу?");
                    if (!ok) return;
                    onDelete(meeting.id);
                    onOpenChange(false);
                  }}
                >
                  Удалить
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
