import type { Employee, Meeting, MeetingPriority, Notification, Theme } from "./types";
import type { EmployeeId, MeetingId } from "./types";
import { addDays, formatISODate } from "./date";
import { createId } from "./id";
import { DEFAULT_MEETING_PRIORITY } from "./meetingColors";

export const STORAGE_KEY = "meeting-calendar:v1";

export type PersistedState = {
  version: 2;
  seeded: boolean;
  theme: Theme;
  employees: Employee[];
  meetings: Meeting[];
  notifications: Notification[];
  currentUserId: EmployeeId | null;
};

function normalizeEmployee(e: Employee): Employee {
  return {
    ...e,
    department: e.department?.trim() || "Общий отдел",
    position: e.position?.trim() || "Сотрудник",
  };
}

function normalizeMeeting(m: Meeting): Meeting {
  const priority = (m as Meeting & { priority?: MeetingPriority }).priority;
  const joinLink = (m as Meeting & { joinLink?: string }).joinLink;
  const materials = (m as Meeting & { materials?: string }).materials;
  const createdByEmployeeId = (m as Meeting & { createdByEmployeeId?: EmployeeId }).createdByEmployeeId;
  const acceptedByEmployeeIds = (m as Meeting & { acceptedByEmployeeIds?: EmployeeId[] }).acceptedByEmployeeIds;
  return {
    ...m,
    priority: priority ?? DEFAULT_MEETING_PRIORITY,
    joinLink: joinLink ?? "",
    materials: materials ?? "",
    createdByEmployeeId: createdByEmployeeId ?? ((m as unknown as { participantIds?: EmployeeId[] }).participantIds?.[0] ?? "e_1"),
    acceptedByEmployeeIds: Array.isArray(acceptedByEmployeeIds) ? acceptedByEmployeeIds : [],
  };
}

function migrateToV2(raw: Record<string, unknown>): PersistedState {
  const employees = (Array.isArray(raw.employees) ? raw.employees : []).map((e) =>
    normalizeEmployee(e as Employee),
  );
  const meetings = (Array.isArray(raw.meetings) ? raw.meetings : []).map((m) =>
    normalizeMeeting(m as Meeting),
  );
  return {
    version: 2,
    seeded: Boolean(raw.seeded),
    theme: (raw.theme as Theme) ?? "light",
    employees,
    meetings,
    notifications: Array.isArray(raw.notifications) ? (raw.notifications as Notification[]) : [],
    currentUserId: (raw.currentUserId as EmployeeId) ?? employees[0]?.id ?? null,
  };
}

export function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed) return null;
    if (!Array.isArray(parsed.employees) || !Array.isArray(parsed.meetings)) return null;
    return migrateToV2(parsed);
  } catch {
    return null;
  }
}

export function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createEmptyState(theme: Theme = "light"): PersistedState {
  return {
    version: 2,
    seeded: true,
    theme,
    employees: [],
    meetings: [],
    notifications: [],
    currentUserId: null,
  };
}

const DEMO_POSITIONS = [
  "Дизайнер",
  "Маркетолог",
  "Руководитель",
  "Менеджер по закупкам",
  "Аналитик",
  "Специалист по рекламе",
  "HR-менеджер",
  "Менеджер по продукту",
  "Инженер"
];

const DEMO_DEPARTMENTS = [
  "Продукт",
  "Маркетинг",
  "Руководство",
  "Закупки",
  "Аналитика",
  "Реклама",
  "HR",
  "Разработка",
  "Инженерия",
];

export function seedDemoData(now: Date, theme: Theme = "light"): PersistedState {
  const employees: Employee[] = [
    { id: "e_1", firstName: "Анна", lastName: "Петрова", position: DEMO_POSITIONS[0], department: DEMO_DEPARTMENTS[0], createdAt: now.getTime() - 1000000 },
    { id: "e_2", firstName: "Сергей", lastName: "Иванов", position: DEMO_POSITIONS[1], department: DEMO_DEPARTMENTS[1], createdAt: now.getTime() - 900000 },
    { id: "e_3", firstName: "Ольга", lastName: "Сидорова", position: DEMO_POSITIONS[2], department: DEMO_DEPARTMENTS[2], createdAt: now.getTime() - 800000 },
    { id: "e_4", firstName: "Дмитрий", lastName: "Кузнецов", position: DEMO_POSITIONS[3], department: DEMO_DEPARTMENTS[3], createdAt: now.getTime() - 700000 },
    { id: "e_5", firstName: "Екатерина", lastName: "Морозова", position: DEMO_POSITIONS[4], department: DEMO_DEPARTMENTS[4], createdAt: now.getTime() - 600000 },
    { id: "e_6", firstName: "Павел", lastName: "Фёдоров", position: DEMO_POSITIONS[5], department: DEMO_DEPARTMENTS[5], createdAt: now.getTime() - 500000 },
    { id: "e_7", firstName: "Марина", lastName: "Волкова", position: DEMO_POSITIONS[6], department: DEMO_DEPARTMENTS[6], createdAt: now.getTime() - 400000 },
    { id: "e_8", firstName: "Иван", lastName: "Смирнов", position: DEMO_POSITIONS[7], department: DEMO_DEPARTMENTS[7], createdAt: now.getTime() - 300000 },
    { id: "e_9", firstName: "Надежда", lastName: "Никитина", position: DEMO_POSITIONS[8], department: DEMO_DEPARTMENTS[8], createdAt: now.getTime() - 200000 },
  ];

  const id = (prefix: string, n: number): MeetingId => `${prefix}_${n}`;

  // Демо-встречи на ближайшие дни (активные относительно текущей даты)
  const meetings: Meeting[] = [
    {
      id: id("m", 1),
      title: "Планирование спринта",
      date: formatISODate(addDays(now, 1)),
      startTime: "10:00",
      endTime: "11:00",
      participantIds: ["e_1", "e_2", "e_3"],
      createdByEmployeeId: "e_3",
      acceptedByEmployeeIds: ["e_1"],
      description: "Уточняем цели спринта и распределяем задачи по направлениям.",
      joinLink: "https://meet.google.com/",
      materials: "Повестка: цели спринта, приоритеты, риски.\nМатериалы: ссылка на бэклог/борд.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 250000
    },
    {
      id: id("m", 2),
      title: "Согласование макета",
      date: formatISODate(addDays(now, 1)),
      startTime: "14:00",
      endTime: "15:00",
      participantIds: ["e_1", "e_8", "e_5"],
      createdByEmployeeId: "e_1",
      acceptedByEmployeeIds: [],
      description: "Проверяем визуальную концепцию и финализируем элементы интерфейса.",
      joinLink: "",
      materials: "Ссылка на макет/прототип.\nСписок спорных моментов.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 240000
    },
    {
      id: id("m", 3),
      title: "Аналитика конверсии",
      date: formatISODate(addDays(now, 2)),
      startTime: "09:30",
      endTime: "10:30",
      participantIds: ["e_5", "e_2", "e_3"],
      createdByEmployeeId: "e_5",
      acceptedByEmployeeIds: ["e_2"],
      description: "Разбираем воронку и определяем следующий шаг оптимизации.",
      joinLink: "",
      materials: "Ссылки на отчёты и дашборды.\nГипотезы на улучшение.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 230000
    },
    {
      id: id("m", 4),
      title: "Маркетинговая стратегия",
      date: formatISODate(addDays(now, 2)),
      startTime: "13:00",
      endTime: "14:00",
      participantIds: ["e_2", "e_6", "e_8"],
      createdByEmployeeId: "e_2",
      acceptedByEmployeeIds: [],
      description: "Корректируем позиционирование и планируем кампании на месяц вперёд.",
      joinLink: "",
      materials: "Каналы, бюджет, KPI.\nПлан на месяц.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 220000
    },
    {
      id: id("m", 5),
      title: "Закупки и поставки",
      date: formatISODate(addDays(now, 2)),
      startTime: "16:00",
      endTime: "17:00",
      participantIds: ["e_4", "e_3"],
      createdByEmployeeId: "e_4",
      acceptedByEmployeeIds: [],
      description: "План-график поставок и согласование приоритетов по закупкам.",
      joinLink: "",
      materials: "Таблица поставок.\nСписок рисков и сроков.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 210000
    },
    {
      id: id("m", 6),
      title: "Рекламный отчёт",
      date: formatISODate(addDays(now, 3)),
      startTime: "11:00",
      endTime: "12:00",
      participantIds: ["e_6", "e_2", "e_5"],
      createdByEmployeeId: "e_6",
      acceptedByEmployeeIds: [],
      description: "Сводим результаты по каналам и обсуждаем гипотезы на следующую итерацию.",
      joinLink: "",
      materials: "Отчёт по кампаниям.\nДальнейшие гипотезы.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 200000
    },
    {
      id: id("m", 7),
      title: "HR-совещание",
      date: formatISODate(addDays(now, 3)),
      startTime: "15:30",
      endTime: "16:15",
      participantIds: ["e_7", "e_3"],
      createdByEmployeeId: "e_7",
      acceptedByEmployeeIds: [],
      description: "Подводим итоги найма и согласуем план собеседований.",
      joinLink: "",
      materials: "Список кандидатов.\nПлан интервью.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 190000
    },
    {
      id: id("m", 8),
      title: "Тех. синхронизация",
      date: formatISODate(addDays(now, 4)),
      startTime: "09:00",
      endTime: "10:00",
      participantIds: ["e_9", "e_8", "e_1"],
      createdByEmployeeId: "e_9",
      acceptedByEmployeeIds: [],
      description: "Обсуждаем архитектурные решения и состояние текущих задач.",
      joinLink: "",
      materials: "Список задач.\nСсылка на RFC/архитектуру.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 180000
    },
    {
      id: id("m", 9),
      title: "Уточнение требований",
      date: formatISODate(addDays(now, 4)),
      startTime: "12:30",
      endTime: "13:30",
      participantIds: ["e_8", "e_3", "e_5"],
      createdByEmployeeId: "e_8",
      acceptedByEmployeeIds: ["e_3"],
      description: "Синхронизируем требования по продуктовой части и критерии приемки.",
      joinLink: "",
      materials: "User stories.\nКритерии приемки.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 170000
    },
    {
      id: id("m", 10),
      title: "Прогресс команды",
      date: formatISODate(addDays(now, 5)),
      startTime: "10:30",
      endTime: "11:15",
      participantIds: ["e_3", "e_1", "e_9"],
      createdByEmployeeId: "e_3",
      acceptedByEmployeeIds: [],
      description: "Короткий статус и разбор блокеров.",
      joinLink: "",
      materials: "Список блокеров.\nПлан действий.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 160000
    }
  ];

  // Добавим ещё немного встреч, чтобы календарь выглядел заполненным
  meetings.push(
    {
      id: id("m", 11),
      title: "Обзор кампаний",
      date: formatISODate(addDays(now, 5)),
      startTime: "14:30",
      endTime: "15:30",
      participantIds: ["e_6", "e_2"],
      createdByEmployeeId: "e_2",
      acceptedByEmployeeIds: [],
      description: "Разбираем эффективность размещений и планируем улучшения.",
      joinLink: "",
      materials: "Отчёт по размещениям.\nСписок улучшений.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 150000
    },
    {
      id: id("m", 12),
      title: "Согласование бюджета",
      date: formatISODate(addDays(now, 6)),
      startTime: "09:30",
      endTime: "10:15",
      participantIds: ["e_4", "e_3", "e_2"],
      createdByEmployeeId: "e_4",
      acceptedByEmployeeIds: ["e_2"],
      description: "Уточняем лимиты и согласуем прогноз по затратам.",
      joinLink: "",
      materials: "Бюджетная таблица.\nПрогноз расходов.",
      priority: DEFAULT_MEETING_PRIORITY,
      createdAt: now.getTime() - 140000
    }
  );

  const demoPriorities: MeetingPriority[] = [
    "important",
    "urgent",
    "normal",
    "low",
    "critical",
    "important",
    "normal",
    "urgent",
    "low",
    "critical",
    "normal",
    "important",
  ];
  const normalizedMeetings = meetings.map((m, i) =>
    normalizeMeeting({
      ...m,
      priority: demoPriorities[i] ?? DEFAULT_MEETING_PRIORITY,
    }),
  );

  const normalizedEmployees = employees.map((e) => ({ ...e, id: String(e.id) }));

  return {
    version: 2,
    seeded: true,
    theme,
    employees: normalizedEmployees,
    meetings: normalizedMeetings,
    notifications: [],
    currentUserId: normalizedEmployees[0]?.id ?? null,
  };
}

export function clearMeetingsAndEmployees(theme: Theme = "light"): PersistedState {
  return createEmptyState(theme);
}

