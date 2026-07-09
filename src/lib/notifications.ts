import type { EmployeeId, Meeting, Notification } from "./types";
import { createId } from "./id";

export function createMeetingNotifications(meeting: Meeting): Notification[] {
  const createdAt = Date.now();
  return meeting.participantIds.map((employeeId) => ({
    id: createId("n"),
    employeeId,
    meetingId: meeting.id,
    title: "Новая встреча",
    message: meeting.joinLink
      ? `Вас пригласили на встречу «${meeting.title}». Ссылка: ${meeting.joinLink}`
      : `Вас пригласили на встречу «${meeting.title}»`,
    date: meeting.date,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    read: false,
    createdAt,
  }));
}

export function showBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }
  if (Notification.permission !== "denied") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") new Notification(title, { body });
    });
  }
}

export function unreadCountForUser(notifications: Notification[], employeeId: EmployeeId | null) {
  if (!employeeId) return 0;
  return notifications.filter((n) => n.employeeId === employeeId && !n.read).length;
}
