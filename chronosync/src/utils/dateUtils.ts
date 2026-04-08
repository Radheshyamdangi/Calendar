import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarCell = {
  date: Date;
  inMonth: boolean;
  key: string;
  label: string;
  iso: string;
  isToday: boolean;
};

export function getMonthDays(year: number, month: number): Date[] {
  const date = new Date(year, month, 1);
  const days: Date[] = [];

  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }

  return days;
}

export function getCalendarMonthGrid(viewDate: Date, weekStartsOn: 0 | 1 = 0): CalendarCell[] {
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

  const today = new Date();
  const cells: CalendarCell[] = [];

  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    const date = new Date(d);
    cells.push({
      date,
      inMonth: isSameMonth(date, monthStart),
      key: format(date, "yyyy-MM-dd"),
      label: String(date.getDate()),
      iso: format(date, "yyyy-MM-dd"),
      isToday: isSameDay(date, today),
    });
  }

  return cells;
}

export function monthTitle(viewDate: Date) {
  return format(viewDate, "MMMM yyyy");
}
