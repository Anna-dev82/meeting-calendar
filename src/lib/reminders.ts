import type { EmployeeId, Meeting } from "./types";
import { toDateTime } from "./date";

const KEY = "meeting-calendar:reminders:v1";

type Store = Record<string, number>;

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveStore(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function meetingReminderKey(meeting: Meeting, employeeId: EmployeeId) {
  // если время встречи изменится — ключ поменяется и напоминание сработает заново
  return `${employeeId}|${meeting.id}|${meeting.date}|${meeting.startTime}`;
}

export function shouldFireReminder(params: {
  meeting: Meeting;
  employeeId: EmployeeId;
  now: Date;
  minutesBeforeStart?: number;
}) {
  const { meeting, employeeId, now, minutesBeforeStart = 10 } = params;
  const start = toDateTime(meeting.date, meeting.startTime);
  const end = toDateTime(meeting.date, meeting.endTime);

  // Не напоминаем по просроченным/идущим встречам
  if (end.getTime() <= now.getTime()) return { fire: false, key: "" };
  if (start.getTime() <= now.getTime()) return { fire: false, key: "" };

  const diffMin = (start.getTime() - now.getTime()) / 60000;
  if (diffMin > minutesBeforeStart || diffMin < 0) return { fire: false, key: "" };

  const key = meetingReminderKey(meeting, employeeId);
  const store = loadStore();
  if (store[key]) return { fire: false, key };

  store[key] = now.getTime();
  saveStore(store);
  return { fire: true, key };
}

