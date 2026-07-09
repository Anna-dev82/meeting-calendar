import type { Meeting } from "./types";
import { toDateTime } from "./date";

export function isMeetingActive(meeting: Meeting, now: Date) {
  const end = toDateTime(meeting.date, meeting.endTime);
  return end.getTime() > now.getTime();
}

