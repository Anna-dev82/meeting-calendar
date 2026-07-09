export type EmployeeId = string;
export type MeetingId = string;

export type Employee = {
  id: EmployeeId;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  createdAt: number;
};

export type NotificationId = string;

export type Notification = {
  id: NotificationId;
  employeeId: EmployeeId;
  meetingId: MeetingId;
  title: string;
  message: string;
  date: string;
  startTime: string;
  endTime: string;
  read: boolean;
  createdAt: number;
};

export type Theme = "light" | "dark";

export type MeetingPriority = "low" | "normal" | "important" | "urgent" | "critical";

export type Meeting = {
  id: MeetingId;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  participantIds: EmployeeId[];
  createdByEmployeeId: EmployeeId; // кто создал (только он может редактировать)
  acceptedByEmployeeIds: EmployeeId[]; // реакции участников: "принято"
  description: string;
  joinLink: string; // ссылка на созвон (Zoom/Meet/Teams)
  materials: string; // тексты/ссылки/повестка
  priority: MeetingPriority;
  createdAt: number;
};

