import React, { useEffect, useMemo, useState } from "react";
import type { Employee, EmployeeId, Meeting } from "../../lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { isMeetingActive } from "../../lib/meetingActivity";
import { createId } from "../../lib/id";

import { formatEmployeeWithRole } from "../../lib/employeeLabel";

export function EmployeeDialog({
  open,
  onOpenChange,
  employees,
  meetings,
  onCreateEmployee,
  onDeleteEmployee
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  meetings: Meeting[];
  onCreateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: EmployeeId) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");

  const now = useMemo(() => new Date(), [open]);

  useEffect(() => {
    if (!open) return;
    setFirstName("");
    setLastName("");
    setPosition("");
    setDepartment("");
  }, [open]);

  const activeByEmployeeId = useMemo(() => {
    const map = new Map<EmployeeId, number>();
    for (const e of employees) map.set(e.id, 0);
    for (const m of meetings) {
      if (!m.participantIds?.length) continue;
      if (!isMeetingActive(m, now)) continue;
      for (const employeeId of m.participantIds) {
        map.set(employeeId, (map.get(employeeId) ?? 0) + 1);
      }
    }
    return map;
  }, [employees, meetings, now]);

  const canSave =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    position.trim().length > 0 &&
    department.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" showClose>
        <DialogHeader>
          <DialogTitle>Добавить сотрудника</DialogTitle>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Сотрудник появится в общем списке. Удаление доступно только при отсутствии активных встреч.
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Анна" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Петрова" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Должность</Label>
              <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Дизайнер" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Отдел</Label>
              <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Продукт" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              disabled={!canSave}
              onClick={() => {
                if (!canSave) return;
                const newEmployee: Employee = {
                  id: createId("e"),
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  position: position.trim(),
                  department: department.trim(),
                  createdAt: Date.now(),
                };
                onCreateEmployee(newEmployee);
                onOpenChange(false);
              }}
            >
              Сохранить
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Список сотрудников</Label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Всего: {employees.length}
              </span>
            </div>

            <div className="rounded-2xl ring-1 ring-slate-200/70 dark:ring-slate-800/70 bg-white/50 dark:bg-slate-900/30 p-3">
              {employees.length === 0 ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">Пока никого нет.</div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {employees.map((e) => {
                    const activeCount = activeByEmployeeId.get(e.id) ?? 0;
                    const canDelete = activeCount === 0;
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between gap-4 rounded-xl px-3 py-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/40"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-50 truncate">{formatEmployeeWithRole(e)}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {activeCount > 0 ? <Badge variant="destructive">активно</Badge> : null}
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={!canDelete}
                            title={!canDelete ? "Нельзя удалить: есть активные встречи" : "Удалить сотрудника"}
                            onClick={() => {
                              const ok = window.confirm("Удалить сотрудника?");
                              if (!ok) return;
                              if (!canDelete) return;
                              onDeleteEmployee(e.id);
                            }}
                          >
                            Удалить
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

