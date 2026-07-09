import type { Employee, EmployeeId, Theme } from "../../lib/types";
import React from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { formatEmployeeWithRole } from "../../lib/employeeLabel";
import { ColorLegend } from "./ColorLegend";

export function ControlsBar({
  viewMode,
  onViewModeChange,
  selectedDateISO,
  onSelectedDateISOChange,
  employees,
  selectedEmployeeId,
  onSelectedEmployeeIdChange,
  searchQuery,
  onSearchQueryChange,
  onClearDemo,
  showCreateDemo,
  onCreateDemo,
  theme,
  onThemeChange
}: {
  viewMode: "day" | "week";
  onViewModeChange: (mode: "day" | "week") => void;
  selectedDateISO: string;
  onSelectedDateISOChange: (iso: string) => void;
  employees: Employee[];
  selectedEmployeeId: EmployeeId | "all";
  onSelectedEmployeeIdChange: (id: EmployeeId | "all") => void;
  searchQuery: string;
  onSearchQueryChange: (v: string) => void;
  onClearDemo: () => void;
  showCreateDemo: boolean;
  onCreateDemo: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}) {
  return (
    <section className="mx-auto max-w-6xl p-4 pt-0">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "day" ? "primary" : "secondary"}
              onClick={() => onViewModeChange("day")}
            >
              День
            </Button>
            <Button
              variant={viewMode === "week" ? "primary" : "secondary"}
              onClick={() => onViewModeChange("week")}
            >
              Неделя
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Дата</Label>
              <input
                type="date"
                className="form-control h-11 rounded-2xl px-4 text-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-blue-400 dark:ring-slate-700"
                value={selectedDateISO}
                onChange={(e) => onSelectedDateISOChange(e.target.value)}
              />
            </div>

            <Button
              variant="ghost"
              onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
              className="px-3"
            >
              Тема: {theme === "light" ? "Светлая" : "Тёмная"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Фильтр встреч</Label>
            <select
              className="form-control h-11 w-full rounded-2xl px-4 text-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-blue-400 dark:ring-slate-700"
              value={selectedEmployeeId === "all" ? "" : selectedEmployeeId}
              onChange={(e) => {
                const v = e.target.value;
                onSelectedEmployeeIdChange(v ? (v as EmployeeId) : "all");
              }}
            >
              <option value="">Все сотрудники</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {formatEmployeeWithRole(e)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Поиск по названию встречи</Label>
            <input
              type="search"
              className="form-control h-11 w-full rounded-2xl px-4 text-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-blue-400 dark:ring-slate-700"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Например: Планирование"
            />
          </div>
        </div>

        <ColorLegend />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Данные сохраняются в <code>localStorage</code>.
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClearDemo}>
              Очистить демо-данные
            </Button>
            {showCreateDemo ? (
              <Button onClick={onCreateDemo}>Создать демо-команду</Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

