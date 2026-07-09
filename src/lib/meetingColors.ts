import type { MeetingPriority } from "./types";

export type PriorityOption = {
  id: MeetingPriority;
  label: string;
  description: string;
  className: string;
};

export const MEETING_PRIORITIES: PriorityOption[] = [
  {
    id: "low",
    label: "Не срочная",
    description: "Можно перенести при необходимости",
    className: "bg-emerald-500",
  },
  {
    id: "normal",
    label: "Обычная",
    description: "Стандартная рабочая встреча",
    className: "bg-blue-500",
  },
  {
    id: "important",
    label: "Срочная",
    description: "Желательно провести в запланированное время",
    className: "bg-amber-500",
  },
  {
    id: "urgent",
    label: "Очень срочная",
    description: "Высокий приоритет, важно не пропустить",
    className: "bg-orange-500",
  },
  {
    id: "critical",
    label: "Горящая",
    description: "Требует немедленного внимания",
    className: "bg-fuchsia-600",
  },
];

export const OVERDUE_STYLE = {
  className: "bg-rose-600",
  label: "Просроченная",
  description: "Встреча уже завершилась (по времени окончания)",
} as const;

export const DEFAULT_MEETING_PRIORITY: MeetingPriority = "normal";

export function getMeetingPriorityOption(priority: MeetingPriority | undefined) {
  const id = priority ?? DEFAULT_MEETING_PRIORITY;
  return MEETING_PRIORITIES.find((p) => p.id === id) ?? MEETING_PRIORITIES[1];
}

/** @deprecated use getMeetingPriorityOption */
export function getMeetingStrip(priorityOrLegacy: MeetingPriority | string | undefined) {
  if (
    priorityOrLegacy === "low" ||
    priorityOrLegacy === "normal" ||
    priorityOrLegacy === "important" ||
    priorityOrLegacy === "urgent" ||
    priorityOrLegacy === "critical"
  ) {
    return getMeetingPriorityOption(priorityOrLegacy);
  }
  return getMeetingPriorityOption(DEFAULT_MEETING_PRIORITY);
}

export const MEETING_COLOR_STRIPS = MEETING_PRIORITIES;
