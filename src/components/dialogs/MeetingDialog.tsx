import React, { useEffect, useMemo, useState } from "react";
import type { Employee, EmployeeId, Meeting, MeetingPriority } from "../../lib/types";
import { getConflictsForParticipants } from "../../lib/meetingConflicts";
import { formatEmployeeWithRole } from "../../lib/employeeLabel";
import {
  DEFAULT_MEETING_PRIORITY,
  getMeetingPriorityOption,
  MEETING_PRIORITIES,
} from "../../lib/meetingColors";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { timeToMinutes } from "../../lib/date";
import { createId } from "../../lib/id";

function fullName(e: Employee) {
  return `${e.firstName} ${e.lastName}`.trim();
}

function getValidationHint(params: {
  title: string;
  startTime: string;
  endTime: string;
  participantIds: EmployeeId[];
  timeValid: boolean;
  hasConflicts: boolean;
  conflictMessage: string;
}): string | null {
  const { title, startTime, endTime, participantIds, timeValid, hasConflicts, conflictMessage } = params;
  if (!title.trim()) return "Укажите название встречи";
  if (!startTime || !endTime) return "Укажите время начала и окончания";
  if (!timeValid) return "Время окончания должно быть позже времени начала";
  if (!participantIds.length) return "Выберите хотя бы одного участника";
  if (hasConflicts && conflictMessage) return conflictMessage;
  return null;
}

export function MeetingDialog({
  open,
  onOpenChange,
  defaultDateISO,
  employees,
  meetings,
  editingMeeting,
  currentUserId,
  onCreateMeeting,
  onUpdateMeeting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDateISO: string;
  employees: Employee[];
  meetings: Meeting[];
  editingMeeting?: Meeting | null;
  currentUserId: EmployeeId | null;
  onCreateMeeting: (meeting: Meeting) => void;
  onUpdateMeeting?: (meeting: Meeting, previous: Meeting) => void;
}) {
  const isEdit = Boolean(editingMeeting);

  const [title, setTitle] = useState("");
  const [dateISO, setDateISO] = useState(defaultDateISO);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [participantIds, setParticipantIds] = useState<EmployeeId[]>([]);
  const [description, setDescription] = useState("");
  const [joinLink, setJoinLink] = useState("");
  const [materials, setMaterials] = useState("");
  const [priority, setPriority] = useState<MeetingPriority>(DEFAULT_MEETING_PRIORITY);

  useEffect(() => {
    if (!open) return;
    if (editingMeeting) {
      setTitle(editingMeeting.title);
      setDateISO(editingMeeting.date);
      setStartTime(editingMeeting.startTime);
      setEndTime(editingMeeting.endTime);
      setParticipantIds(editingMeeting.participantIds);
      setDescription(editingMeeting.description);
      setJoinLink(editingMeeting.joinLink ?? "");
      setMaterials(editingMeeting.materials ?? "");
      setPriority(editingMeeting.priority ?? DEFAULT_MEETING_PRIORITY);
      return;
    }
    setTitle("");
    setDateISO(defaultDateISO);
    setStartTime("10:00");
    setEndTime("11:00");
    setParticipantIds([]);
    setDescription("");
    setJoinLink("");
    setMaterials("");
    setPriority(DEFAULT_MEETING_PRIORITY);
  }, [open, defaultDateISO, editingMeeting]);

  const employeesById = useMemo(() => new Map(employees.map((e) => [e.id, e] as const)), [employees]);

  const conflictsByEmployeeId = useMemo(() => {
    return getConflictsForParticipants({
      meetings,
      employees,
      dateISO,
      startTimeHHmm: startTime,
      endTimeHHmm: endTime,
      participantIds,
      excludeMeetingId: editingMeeting?.id,
    });
  }, [meetings, employees, dateISO, startTime, endTime, participantIds, editingMeeting?.id]);

  const conflictsForSelected = useMemo(() => {
    return participantIds.filter((id) => (conflictsByEmployeeId[id] ?? []).length > 0);
  }, [participantIds, conflictsByEmployeeId]);

  const hasConflicts = conflictsForSelected.length > 0;

  const firstConflict = useMemo(() => {
    for (const employeeId of participantIds) {
      const list = conflictsByEmployeeId[employeeId] ?? [];
      if (list.length) return { employeeId, meeting: list[0] };
    }
    return null;
  }, [conflictsByEmployeeId, participantIds]);

  const timeValid = useMemo(() => {
    if (!startTime || !endTime) return false;
    return timeToMinutes(endTime) > timeToMinutes(startTime);
  }, [startTime, endTime]);

  const conflictMessage = useMemo(() => {
    if (!firstConflict) return "";
    const employee = employeesById.get(firstConflict.employeeId);
    if (!employee) return "";
    return `${fullName(employee)} уже участвует во встрече с ${firstConflict.meeting.startTime} до ${firstConflict.meeting.endTime}`;
  }, [firstConflict, employeesById]);

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!dateISO) return false;
    if (!startTime || !endTime) return false;
    if (!participantIds.length) return false;
    if (!timeValid) return false;
    if (hasConflicts) return false;
    return true;
  }, [title, dateISO, startTime, endTime, participantIds.length, timeValid, hasConflicts]);

  const validationHint = useMemo(
    () =>
      getValidationHint({
        title,
        startTime,
        endTime,
        participantIds,
        timeValid,
        hasConflicts,
        conflictMessage,
      }),
    [title, startTime, endTime, participantIds, timeValid, hasConflicts, conflictMessage],
  );

  function toggleParticipant(employeeId: EmployeeId) {
    setParticipantIds((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId],
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    if (isEdit && editingMeeting && onUpdateMeeting) {
      onUpdateMeeting(
        {
          ...editingMeeting,
          title: title.trim(),
          date: dateISO,
          startTime,
          endTime,
          participantIds,
          description: description.trim(),
          joinLink: joinLink.trim(),
          materials: materials.trim(),
          // creator/reactions не меняем при редактировании
          createdByEmployeeId: editingMeeting.createdByEmployeeId,
          acceptedByEmployeeIds: editingMeeting.acceptedByEmployeeIds,
          priority,
        },
        editingMeeting,
      );
      onOpenChange(false);
      return;
    }
    const newMeeting: Meeting = {
      id: createId("m"),
      title: title.trim(),
      date: dateISO,
      startTime,
      endTime,
      participantIds,
      createdByEmployeeId: currentUserId ?? participantIds[0],
      acceptedByEmployeeIds: [],
      description: description.trim(),
      joinLink: joinLink.trim(),
      materials: materials.trim(),
      priority,
      createdAt: Date.now(),
    };
    onCreateMeeting(newMeeting);
    onOpenChange(false);
  }

  const priorityPreview = getMeetingPriorityOption(priority);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showClose>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать встречу" : "Создать встречу"}</DialogTitle>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {isEdit
              ? "Измените участников, описание, важность и другие поля."
              : "Проверьте занятость участников — конфликты подсвечиваются сразу."}
          </div>
        </DialogHeader>

        <div className="space-y-4 text-slate-900 dark:text-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название встречи</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: Планирование спринта"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Дата</Label>
              <Input id="date" type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Время начала</Label>
              <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Время окончания</Label>
              <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Важность встречи</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MEETING_PRIORITIES.map((p) => {
                const selected = priority === p.id;
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2 ring-1 transition",
                      selected
                        ? "ring-blue-400 bg-blue-50/80 dark:bg-blue-950/30"
                        : "ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="priority"
                      checked={selected}
                      onChange={() => setPriority(p.id)}
                      className="mt-1 accent-blue-500"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", p.className)} aria-hidden />
                        {p.label}
                      </span>
                      <span className="block text-xs text-slate-600 dark:text-slate-400 mt-0.5">{p.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Выбрано: <span className={cn("inline-block h-2 w-2 rounded-full align-middle mr-1", priorityPreview.className)} />
              {priorityPreview.label}
            </p>
          </div>

          {!timeValid && startTime && endTime ? (
            <div className="rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
              Время окончания должно быть позже времени начала.
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Участники</Label>
            <div className="rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
              {employees.length === 0 ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">Сначала добавьте сотрудников.</div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {employees.map((e) => {
                    const checked = participantIds.includes(e.id);
                    const conflict = checked ? (conflictsByEmployeeId[e.id] ?? [])[0] : undefined;
                    return (
                      <label
                        key={e.id}
                        className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-white/80 dark:hover:bg-slate-700/50 cursor-pointer"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleParticipant(e.id)}
                            className="h-4 w-4 shrink-0 accent-blue-500"
                          />
                          <span className="min-w-0 text-sm text-slate-900 dark:text-slate-100 break-words">
                            {formatEmployeeWithRole(e)}
                          </span>
                        </span>

                        {conflict ? <Badge variant="destructive">занят</Badge> : null}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {hasConflicts && firstConflict ? (
              <div className="mt-3 rounded-2xl bg-rose-500/10 ring-1 ring-rose-500/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                {conflictMessage}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Описание</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Коротко опишите цель встречи"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinLink">Ссылка на встречу</Label>
            <Input
              id="joinLink"
              value={joinLink}
              onChange={(e) => setJoinLink(e.target.value)}
              placeholder="Например: https://meet.google.com/…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials">Материалы / ссылки / повестка</Label>
            <Textarea
              id="materials"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="Ссылки, файлы, повестка, краткие заметки…"
            />
          </div>

          <div className="flex flex-col items-end gap-2 pt-2">
            {!canSubmit && validationHint ? (
              <p className="w-full text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 ring-1 ring-amber-500/20 rounded-xl px-4 py-2">
                {validationHint}
              </p>
            ) : null}
            <div className="flex justify-end gap-3 w-full">
              <Button variant="secondary" type="button" onClick={() => onOpenChange(false)}>
                Отмена
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={!canSubmit} className="min-w-[220px]">
                {isEdit ? "Сохранить изменения" : "Создать встречу"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
