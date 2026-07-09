import React, { useEffect, useRef, useState } from "react";
import type { Employee, EmployeeId, Notification } from "../../lib/types";
import { unreadCountForUser } from "../../lib/notifications";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

function fullName(e: Employee) {
  return `${e.firstName} ${e.lastName}`.trim();
}

export function NotificationsPanel({
  employees,
  notifications,
  currentUserId,
  onCurrentUserChange,
  onMarkRead,
  onMarkAllRead,
}: {
  employees: Employee[];
  notifications: Notification[];
  currentUserId: EmployeeId | null;
  onCurrentUserChange: (id: EmployeeId | null) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = unreadCountForUser(notifications, currentUserId);

  const userNotifications = currentUserId
    ? notifications
        .filter((n) => n.employeeId === currentUserId)
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="flex flex-wrap items-center gap-3" ref={panelRef}>
      <div className="flex items-center gap-2">
        <label htmlFor="current-user" className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
          Вы вошли как:
        </label>
        <select
          id="current-user"
          className="form-control h-9 rounded-xl px-3 text-sm ring-1 ring-slate-200 outline-none dark:ring-slate-700 max-w-[200px]"
          value={currentUserId ?? ""}
          onChange={(e) => onCurrentUserChange(e.target.value ? (e.target.value as EmployeeId) : null)}
        >
          <option value="">Не выбран</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {fullName(e)}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative"
          disabled={!currentUserId}
          title={!currentUserId ? "Выберите сотрудника, чтобы видеть уведомления" : "Уведомления"}
        >
          <span aria-hidden>🔔</span>
          Уведомления
          {unread > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>

        {open && currentUserId ? (
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,360px)] rounded-2xl bg-white dark:bg-slate-900 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
              <span className="font-semibold text-slate-900 dark:text-slate-50">Уведомления</span>
              {unread > 0 ? (
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:underline dark:text-blue-400"
                  onClick={onMarkAllRead}
                >
                  Прочитать все
                </button>
              ) : null}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {userNotifications.length === 0 ? (
                <p className="p-4 text-sm text-slate-500 dark:text-slate-400">Нет уведомлений</p>
              ) : (
                userNotifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition",
                      !n.read && "bg-blue-50/80 dark:bg-blue-950/30",
                    )}
                    onClick={() => onMarkRead(n.id)}
                  >
                    <div className="font-medium text-sm text-slate-900 dark:text-slate-50">{n.title}</div>
                    <div className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{n.message}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {n.date} · {n.startTime}–{n.endTime}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
