import type { Employee, EmployeeId, Meeting, MeetingId } from "./types";
import { rangesOverlap, timeToMinutes, toDateTime } from "./date";

export type ConflictsByEmployeeId = Partial<Record<EmployeeId, Meeting[]>>;

export function getConflictsForParticipants(params: {
  meetings: Meeting[];
  employees: Employee[];
  dateISO: string; // YYYY-MM-DD
  startTimeHHmm: string;
  endTimeHHmm: string;
  participantIds: EmployeeId[];
  excludeMeetingId?: MeetingId;
}) {
  const { meetings, dateISO, startTimeHHmm, endTimeHHmm, participantIds, excludeMeetingId } = params;

  if (!participantIds.length) return {} as ConflictsByEmployeeId;
  if (!startTimeHHmm || !endTimeHHmm) return {} as ConflictsByEmployeeId;

  const startMin = timeToMinutes(startTimeHHmm);
  const endMin = timeToMinutes(endTimeHHmm);
  if (endMin <= startMin) return {} as ConflictsByEmployeeId;

  const sameDayMeetings = meetings.filter(
    (m) => m.date === dateISO && m.id !== excludeMeetingId,
  );
  const conflicts: ConflictsByEmployeeId = {};

  const proposedStart = toDateTime(dateISO, startTimeHHmm);
  const proposedEnd = toDateTime(dateISO, endTimeHHmm);

  for (const employeeId of participantIds) {
    const overlapping = sameDayMeetings
      .filter((m) => m.participantIds.includes(employeeId))
      .filter((m) => {
        const mStart = toDateTime(m.date, m.startTime);
        const mEnd = toDateTime(m.date, m.endTime);
        return rangesOverlap(proposedStart, proposedEnd, mStart, mEnd);
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (overlapping.length) conflicts[employeeId] = overlapping;
  }

  return conflicts;
}

