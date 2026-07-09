import React, { useEffect, useMemo, useState } from "react";
import type { Employee, EmployeeId, Meeting, Notification, Theme } from "./lib/types";
import { formatISODate, parseISODate, addDays, startOfWeekMonday } from "./lib/date";
import { loadState, saveState, seedDemoData, clearMeetingsAndEmployees } from "./lib/storage";
import { createMeetingNotifications, showBrowserNotification } from "./lib/notifications";
import { shouldFireReminder } from "./lib/reminders";
import { createId } from "./lib/id";
import { Header } from "./components/layout/Header";
import { ControlsBar } from "./components/layout/ControlsBar";
import { DayView } from "./components/views/DayView";
import { WeekView } from "./components/views/WeekView";
import { MeetingDialog } from "./components/dialogs/MeetingDialog";
import { MeetingDetailDialog } from "./components/dialogs/MeetingDetailDialog";
import { EmployeeDialog } from "./components/dialogs/EmployeeDialog";
import { SidebarCalendar } from "./components/layout/SidebarCalendar";

export default function App() {
  const [hydrated, setHydrated] = useState(false);

  const [theme, setTheme] = useState<Theme>("light");
  const [seeded, setSeeded] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<EmployeeId | null>(null);

  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDateISO, setSelectedDateISO] = useState(formatISODate(new Date()));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<EmployeeId | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [viewingMeeting, setViewingMeeting] = useState<Meeting | null>(null);

  const [showCreateDemo, setShowCreateDemo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const persisted = loadState();
    const now = new Date();

    if (!persisted || !persisted.seeded) {
      const demo = seedDemoData(now, "light");
      setTheme(demo.theme);
      setSeeded(true);
      setEmployees(demo.employees);
      setMeetings(demo.meetings);
      setNotifications(demo.notifications);
      setCurrentUserId(demo.currentUserId);
      setSelectedEmployeeId(demo.currentUserId ?? "all");
      saveState(demo);
      setShowCreateDemo(false);
      setHydrated(true);
      return;
    }

    setTheme(persisted.theme ?? "light");
    setSeeded(Boolean(persisted.seeded));
    setEmployees(persisted.employees ?? []);
    setMeetings(persisted.meetings ?? []);
    setNotifications(persisted.notifications ?? []);
    setCurrentUserId(persisted.currentUserId ?? persisted.employees[0]?.id ?? null);
    setSelectedEmployeeId((persisted.currentUserId ?? persisted.employees[0]?.id) ? (persisted.currentUserId ?? persisted.employees[0]?.id)! : "all");

    const empty = (persisted.employees?.length ?? 0) === 0 && (persisted.meetings?.length ?? 0) === 0;
    setShowCreateDemo(empty);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState({
      version: 2,
      seeded,
      theme,
      employees,
      meetings,
      notifications,
      currentUserId,
    });
  }, [hydrated, theme, seeded, employees, meetings, notifications, currentUserId]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  function handleCurrentUserChange(id: EmployeeId | null) {
    setCurrentUserId(id);
    // Важно: каждый видит именно свои встречи
    setSelectedEmployeeId(id ?? "all");
  }

  const employeesById = useMemo(() => new Map(employees.map((e) => [e.id, e] as const)), [employees]);

  const searchNormalized = searchQuery.trim().toLowerCase();

  const filteredBySearchAndEmployee = useMemo(() => {
    return meetings.filter((m) => {
      const matchesEmployee =
        selectedEmployeeId === "all" ? true : m.participantIds.includes(selectedEmployeeId);
      if (!matchesEmployee) return false;

      const matchesSearch = searchNormalized ? m.title.toLowerCase().includes(searchNormalized) : true;
      if (!matchesSearch) return false;

      return true;
    });
  }, [meetings, searchNormalized, selectedEmployeeId]);

  const dayMeetings = useMemo(() => {
    return filteredBySearchAndEmployee
      .filter((m) => m.date === selectedDateISO)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [filteredBySearchAndEmployee, selectedDateISO]);

  const weekDaysISO = useMemo(() => {
    const base = parseISODate(selectedDateISO);
    const weekStart = startOfWeekMonday(base);
    return Array.from({ length: 7 }, (_, i) => formatISODate(addDays(weekStart, i)));
  }, [selectedDateISO]);

  const datesWithMeetings = useMemo(() => {
    const dates = new Set<string>();
    for (const m of filteredBySearchAndEmployee) {
      dates.add(m.date);
    }
    return dates;
  }, [filteredBySearchAndEmployee]);

  function openCreateMeeting() {
    setEditingMeeting(null);
    setMeetingDialogOpen(true);
  }

  function openEditMeeting(meeting: Meeting) {
    // Редактировать может только создатель
    if (!currentUserId || meeting.createdByEmployeeId !== currentUserId) {
      setToastMessage("Редактировать встречу может только её создатель.");
      return;
    }
    setEditingMeeting(meeting);
    setMeetingDialogOpen(true);
    setViewingMeeting(null);
  }

  const meetingsByDayISO = useMemo(() => {
    const set = new Set(weekDaysISO);
    const map: Record<string, Meeting[]> = {};
    for (const dayISO of weekDaysISO) map[dayISO] = [];

    for (const m of filteredBySearchAndEmployee) {
      if (!set.has(m.date)) continue;
      map[m.date].push(m);
    }

    for (const dayISO of weekDaysISO) {
      map[dayISO].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    return map;
  }, [filteredBySearchAndEmployee, weekDaysISO]);

  const canEditMeeting = (m: Meeting) => Boolean(currentUserId && m.createdByEmployeeId === currentUserId);

  function handleCreateMeeting(meeting: Meeting) {
    setMeetings((prev) => [...prev, meeting]);
    const newNotifications = createMeetingNotifications(meeting);
    setNotifications((prev) => [...newNotifications, ...prev]);

    if (currentUserId && meeting.participantIds.includes(currentUserId)) {
      const mine = newNotifications.find((n) => n.employeeId === currentUserId);
      if (mine) {
        setToastMessage(`${mine.message} (${mine.date}, ${mine.startTime}–${mine.endTime})`);
        showBrowserNotification(mine.title, `${mine.message}\n${mine.date} ${mine.startTime}–${mine.endTime}`);
      }
    }

    setMeetingDialogOpen(false);
  }

  function handleUpdateMeeting(updated: Meeting, previous: Meeting) {
    // Серверного контроля нет, но в UI не дадим редактировать чужое
    if (!currentUserId || previous.createdByEmployeeId !== currentUserId) {
      setToastMessage("Редактировать встречу может только её создатель.");
      return;
    }
    setMeetings((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setViewingMeeting((cur) => (cur?.id === updated.id ? updated : cur));

    const addedIds = updated.participantIds.filter((id) => !previous.participantIds.includes(id));
    if (addedIds.length > 0) {
      const newNotifications = createMeetingNotifications({
        ...updated,
        participantIds: addedIds,
      });
      setNotifications((prev) => [...newNotifications, ...prev]);
    }

    setEditingMeeting(null);
    setMeetingDialogOpen(false);
  }

  // Напоминания о встречах (за 10 минут) для текущего пользователя
  useEffect(() => {
    if (!hydrated) return;
    if (!currentUserId) return;

    const tick = () => {
      const now = new Date();
      for (const m of meetings) {
        if (!m.participantIds.includes(currentUserId)) continue;
        const r = shouldFireReminder({ meeting: m, employeeId: currentUserId, now, minutesBeforeStart: 10 });
        if (!r.fire) continue;

        const base = `Напоминание: «${m.title}» начнётся через ~10 минут`;
        const withTime = `${base} (${m.date}, ${m.startTime}–${m.endTime})`;
        setToastMessage(withTime);
        showBrowserNotification("Напоминание о встрече", m.joinLink ? `${withTime}\nСсылка: ${m.joinLink}` : withTime);
      }
    };

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [hydrated, currentUserId, meetings]);

  function handleDeleteMeeting(meetingId: string) {
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    setNotifications((prev) => prev.filter((n) => n.meetingId !== meetingId));
    setViewingMeeting((cur) => (cur?.id === meetingId ? null : cur));
  }

  function handleCreateEmployee(employee: Employee) {
    setEmployees((prev) => [...prev, employee]);
    if (!currentUserId && employees.length === 0) {
      setCurrentUserId(employee.id);
    }
    setEmployeeDialogOpen(false);
  }

  function handleDeleteEmployee(employeeId: EmployeeId) {
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    setMeetings((prev) =>
      prev
        .map((m) => ({ ...m, participantIds: m.participantIds.filter((id) => id !== employeeId) }))
        .filter((m) => m.participantIds.length > 0),
    );
    setNotifications((prev) => prev.filter((n) => n.employeeId !== employeeId));
    setSelectedEmployeeId((cur) => (cur === employeeId ? "all" : cur));
    setCurrentUserId((cur) => (cur === employeeId ? null : cur));
    setEmployeeDialogOpen(false);
  }

  function handleClearDemo() {
    const next = clearMeetingsAndEmployees(theme);
    setSeeded(true);
    setEmployees(next.employees);
    setMeetings(next.meetings);
    setNotifications(next.notifications);
    setCurrentUserId(null);
    setShowCreateDemo(true);
  }

  function handleCreateDemo() {
    const demo = seedDemoData(new Date(), theme);
    setSeeded(true);
    setEmployees(demo.employees);
    setMeetings(demo.meetings);
    setNotifications(demo.notifications);
    setCurrentUserId(demo.currentUserId);
    setShowCreateDemo(false);
  }

  function handleMarkNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function handleMarkAllNotificationsRead() {
    if (!currentUserId) return;
    setNotifications((prev) =>
      prev.map((n) => (n.employeeId === currentUserId ? { ...n, read: true } : n)),
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        employees={employees}
        notifications={notifications}
        currentUserId={currentUserId}
        onCurrentUserChange={handleCurrentUserChange}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onAddMeeting={openCreateMeeting}
        onAddEmployee={() => setEmployeeDialogOpen(true)}
        toastMessage={toastMessage}
      />
      <ControlsBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDateISO={selectedDateISO}
        onSelectedDateISOChange={setSelectedDateISO}
        employees={employees}
        selectedEmployeeId={selectedEmployeeId}
        onSelectedEmployeeIdChange={setSelectedEmployeeId}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClearDemo={handleClearDemo}
        showCreateDemo={showCreateDemo}
        onCreateDemo={handleCreateDemo}
        theme={theme}
        onThemeChange={setTheme}
      />

      <main className="mx-auto max-w-7xl px-4 pb-10">
        {!hydrated ? null : (
          <div className="flex flex-col lg:flex-row gap-6">
            <aside className="w-full lg:w-64 shrink-0">
              <SidebarCalendar
                selectedDateISO={selectedDateISO}
                onSelectDate={(iso) => {
                  setSelectedDateISO(iso);
                  setViewMode("day");
                }}
                datesWithMeetings={datesWithMeetings}
              />
            </aside>

            <div className="flex-1 min-w-0">
              {viewMode === "day" ? (
                <DayView
                  dateISO={selectedDateISO}
                  meetings={dayMeetings}
                  employeesById={employeesById}
                  onDeleteMeeting={handleDeleteMeeting}
                  onEditMeeting={openEditMeeting}
                  canEditMeeting={canEditMeeting}
                  onOpenMeeting={setViewingMeeting}
                />
              ) : (
                <WeekView
                  now={new Date()}
                  weekDaysISO={weekDaysISO}
                  meetingsByDayISO={meetingsByDayISO}
                  employeesById={employeesById}
                  onDeleteMeeting={handleDeleteMeeting}
                  onOpenMeeting={setViewingMeeting}
                  onEditMeeting={openEditMeeting}
                  canEditMeeting={canEditMeeting}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={(open) => {
          setMeetingDialogOpen(open);
          if (!open) setEditingMeeting(null);
        }}
        defaultDateISO={selectedDateISO}
        employees={employees}
        meetings={meetings}
        editingMeeting={editingMeeting}
        currentUserId={currentUserId}
        onCreateMeeting={handleCreateMeeting}
        onUpdateMeeting={handleUpdateMeeting}
      />

      <EmployeeDialog
        open={employeeDialogOpen}
        onOpenChange={setEmployeeDialogOpen}
        employees={employees}
        meetings={meetings}
        onCreateEmployee={handleCreateEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />

      <MeetingDetailDialog
        meeting={viewingMeeting}
        employeesById={employeesById}
        currentUserId={currentUserId}
        open={viewingMeeting !== null}
        onOpenChange={(open) => {
          if (!open) setViewingMeeting(null);
        }}
        onDelete={handleDeleteMeeting}
        onEdit={openEditMeeting}
        onAccept={(meetingId) => {
          if (!currentUserId) return;
          const employee = employeesById.get(currentUserId);
          if (!employee) return;

          let meetingForNotify: Meeting | null = null;
          setMeetings((prev) =>
            prev.map((m) => {
              if (m.id !== meetingId) return m;
              if (!m.participantIds.includes(currentUserId)) return m;
              if (m.createdByEmployeeId === currentUserId) return m; // у создателя нет "принять"
              if (m.acceptedByEmployeeIds.includes(currentUserId)) return m;
              const next = { ...m, acceptedByEmployeeIds: [...m.acceptedByEmployeeIds, currentUserId] };
              meetingForNotify = next;
              return next;
            }),
          );

          if (meetingForNotify) {
            // Мгновенно обновляем UI в открытом окне
            setViewingMeeting(meetingForNotify);
            setToastMessage("Отмечено как «Принято»");

            setNotifications((prev) => [
              {
                id: createId("n"),
                employeeId: meetingForNotify.createdByEmployeeId,
                meetingId: meetingForNotify.id,
                title: "Участник принял встречу",
                message: `${employee.firstName} ${employee.lastName} отметил(а) «Принято» для встречи «${meetingForNotify.title}»`,
                date: meetingForNotify.date,
                startTime: meetingForNotify.startTime,
                endTime: meetingForNotify.endTime,
                read: false,
                createdAt: Date.now(),
              },
              ...prev,
            ]);
          }
        }}
      />
    </div>
  );
}
