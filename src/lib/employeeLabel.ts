import type { Employee } from "./types";

export function formatEmployeeWithRole(e: Employee) {
  const dept = e.department?.trim() || "Общий отдел";
  const position = e.position?.trim() || "Сотрудник";
  return `${e.firstName} ${e.lastName} (${position}, ${dept})`;
}
