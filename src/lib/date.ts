function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatISODate(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map((v) => Number(v));
  // local time
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateTime(dateISO: string, timeHHmm: string) {
  // dateISO: YYYY-MM-DD, timeHHmm: HH:mm
  return new Date(`${dateISO}T${timeHHmm}:00`);
}

export function timeToMinutes(timeHHmm: string) {
  const [h, m] = timeHHmm.split(":").map((v) => Number(v));
  return h * 60 + m;
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  // пересечение на полуинтервале [start, end)
  return aStart < bEnd && aEnd > bStart;
}

export function startOfWeekMonday(date: Date) {
  // getDay(): 0 (Sun) ... 6 (Sat)
  const day = date.getDay();
  const diff = (day + 6) % 7; // days since Monday
  const d = new Date(date);
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeekMonday(date: Date) {
  const start = startOfWeekMonday(date);
  const end = addDays(start, 7);
  return end;
}

export function getCalendarMonthDays(anchor: Date) {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const firstOfMonth = new Date(y, m, 1);
  const start = startOfWeekMonday(firstOfMonth);
  const days: { dateISO: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i);
    days.push({ dateISO: formatISODate(d), inMonth: d.getMonth() === m });
  }
  return days;
}

export function addMonths(d: Date, months: number) {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}

