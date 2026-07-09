import React from "react";
import type { Employee, EmployeeId, Notification } from "../../lib/types";
import { Button } from "../ui/button";
import { NotificationsPanel } from "./NotificationsPanel";

export function Header({
  employees,
  notifications,
  currentUserId,
  onCurrentUserChange,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onAddMeeting,
  onAddEmployee,
  toastMessage,
}: {
  employees: Employee[];
  notifications: Notification[];
  currentUserId: EmployeeId | null;
  onCurrentUserChange: (id: EmployeeId | null) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onAddMeeting: () => void;
  onAddEmployee: () => void;
  toastMessage: string | null;
}) {
  return (
    <header className="mx-auto max-w-6xl p-4">
      {toastMessage ? (
        <div
          className="mb-4 rounded-2xl bg-blue-500/15 ring-1 ring-blue-500/25 px-4 py-3 text-sm text-blue-900 dark:text-blue-100"
          role="status"
        >
          {toastMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Meeting Calendar</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Внутренний календарь встреч компании
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <NotificationsPanel
            employees={employees}
            notifications={notifications}
            currentUserId={currentUserId}
            onCurrentUserChange={onCurrentUserChange}
            onMarkRead={onMarkNotificationRead}
            onMarkAllRead={onMarkAllNotificationsRead}
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button type="button" onClick={onAddMeeting}>
              + Добавить встречу
            </Button>
            <Button type="button" variant="secondary" onClick={onAddEmployee}>
              + Добавить сотрудника
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
