import { create } from "zustand";
import { format, isAfter, isBefore, isSameDay, parse } from "date-fns";
import { findEventByQuery } from "../data/events";

export type DateRange = { start: Date | null; end: Date | null };

export type RangeNote = {
  id: string;
  startISO: string; // yyyy-MM-dd
  endISO: string; // yyyy-MM-dd
  text: string;
  updatedAt: number;
};

export type DayNote = {
  iso: string; // yyyy-MM-dd
  text: string;
  updatedAt: number;
};

export type CalendarMode = "day" | "range";

type CalendarState = {
  viewDate: Date;
  range: DateRange;
  hoverDate: Date | null;
  highlightedDateISO: string | null;
  activeDayISO: string | null;
  mode: CalendarMode;
  notes: RangeNote[];
  dayNotes: Record<string, DayNote>;

  setViewDate: (d: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;

  setHoverDate: (d: Date | null) => void;
  selectDate: (d: Date) => void;
  onDayPress: (d: Date) => void;
  setRange: (range: { start: Date; end: Date }) => void;
  clearRange: () => void;

  setHighlightedDateISO: (iso: string | null) => void;

  setMode: (mode: CalendarMode) => void;
  openDayISO: (iso: string) => void;
  closeDay: () => void;
  upsertDayNote: (iso: string, text: string) => void;

  upsertNoteForRange: (range: { start: Date; end: Date }, text: string) => void;
  deleteNote: (id: string) => void;

  jumpToRangeISO: (startISO: string, endISO: string) => void;
  jumpToQuery: (query: string) => { ok: boolean; message?: string };
};

const STORAGE_KEY = "chronosync.calendar.v1";

function toISODate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function clampRange(start: Date, end: Date) {
  if (isAfter(start, end)) return { start: end, end: start };
  return { start, end };
}

function randomId() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function loadFromStorage(): Pick<
  CalendarState,
  "viewDate" | "range" | "notes" | "highlightedDateISO" | "activeDayISO" | "mode" | "dayNotes"
> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      viewDateISO?: string;
      range?: { startISO?: string | null; endISO?: string | null };
      notes?: RangeNote[];
      highlightedDateISO?: string | null;
      activeDayISO?: string | null;
      mode?: CalendarMode;
      dayNotes?: Record<string, DayNote>;
    };

    const viewDate =
      parsed.viewDateISO && typeof parsed.viewDateISO === "string"
        ? new Date(parsed.viewDateISO)
        : new Date();

    const start =
      parsed.range?.startISO && typeof parsed.range.startISO === "string"
        ? new Date(parsed.range.startISO)
        : null;
    const end =
      parsed.range?.endISO && typeof parsed.range.endISO === "string" ? new Date(parsed.range.endISO) : null;

    return {
      viewDate: Number.isNaN(viewDate.getTime()) ? new Date() : viewDate,
      range: {
        start: start && !Number.isNaN(start.getTime()) ? start : null,
        end: end && !Number.isNaN(end.getTime()) ? end : null,
      },
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      highlightedDateISO: typeof parsed.highlightedDateISO === "string" ? parsed.highlightedDateISO : null,
      activeDayISO: typeof parsed.activeDayISO === "string" ? parsed.activeDayISO : null,
      mode: parsed.mode === "range" ? "range" : "day",
      dayNotes: parsed.dayNotes && typeof parsed.dayNotes === "object" ? parsed.dayNotes : {},
    };
  } catch {
    return null;
  }
}

function saveToStorage(state: CalendarState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        viewDateISO: state.viewDate.toISOString(),
        range: {
          startISO: state.range.start ? toISODate(state.range.start) : null,
          endISO: state.range.end ? toISODate(state.range.end) : null,
        },
        notes: state.notes,
        highlightedDateISO: state.highlightedDateISO,
        activeDayISO: state.activeDayISO,
        mode: state.mode,
        dayNotes: state.dayNotes,
      })
    );
  } catch {
    // ignore
  }
}

const FALLBACK = {
  viewDate: new Date(),
  range: { start: null, end: null } as DateRange,
  notes: [] as RangeNote[],
  highlightedDateISO: null as string | null,
  activeDayISO: null as string | null,
  mode: "day" as CalendarMode,
  dayNotes: {} as Record<string, DayNote>,
};

const initial = typeof window !== "undefined" ? loadFromStorage() : null;

export const useCalendarStore = create<CalendarState>((set, get) => ({
  viewDate: initial?.viewDate ?? FALLBACK.viewDate,
  range: initial?.range ?? FALLBACK.range,
  hoverDate: null,
  highlightedDateISO: initial?.highlightedDateISO ?? FALLBACK.highlightedDateISO,
  activeDayISO: initial?.activeDayISO ?? FALLBACK.activeDayISO,
  mode: initial?.mode ?? FALLBACK.mode,
  notes: initial?.notes ?? FALLBACK.notes,
  dayNotes: initial?.dayNotes ?? FALLBACK.dayNotes,

  setViewDate: (d) => {
    set({ viewDate: d });
    saveToStorage(get());
  },
  nextMonth: () => {
    const d = new Date(get().viewDate);
    d.setMonth(d.getMonth() + 1);
    set({ viewDate: d });
    saveToStorage(get());
  },
  prevMonth: () => {
    const d = new Date(get().viewDate);
    d.setMonth(d.getMonth() - 1);
    set({ viewDate: d });
    saveToStorage(get());
  },

  setHoverDate: (d) => set({ hoverDate: d }),

  selectDate: (d) => {
    const { range } = get();

    if (!range.start) {
      set({ range: { start: d, end: null }, highlightedDateISO: toISODate(d) });
      saveToStorage(get());
      return;
    }

    if (!range.end) {
      const clamped = clampRange(range.start, d);
      set({ range: { start: clamped.start, end: clamped.end }, highlightedDateISO: toISODate(d) });
      saveToStorage(get());
      return;
    }

    set({ range: { start: d, end: null }, highlightedDateISO: toISODate(d) });
    saveToStorage(get());
  },

  onDayPress: (d) => {
    const mode = get().mode;
    if (mode === "range") {
      get().selectDate(d);
      return;
    }
    const iso = toISODate(d);
    const view = new Date(d.getFullYear(), d.getMonth(), 1);
    set({
      viewDate: view,
      highlightedDateISO: iso,
      activeDayISO: iso,
      range: { start: d, end: d },
      hoverDate: null,
    });
    saveToStorage(get());
  },

  setRange: (range) => {
    const clamped = clampRange(range.start, range.end);
    const view = new Date(clamped.start.getFullYear(), clamped.start.getMonth(), 1);
    set({
      range: { start: clamped.start, end: clamped.end },
      viewDate: view,
      highlightedDateISO: toISODate(clamped.start),
      hoverDate: null,
    });
    saveToStorage(get());
  },

  clearRange: () => {
    set({ range: { start: null, end: null }, hoverDate: null });
    saveToStorage(get());
  },

  setHighlightedDateISO: (iso) => {
    set({ highlightedDateISO: iso });
    saveToStorage(get());
  },

  setMode: (mode) => {
    set({ mode });
    saveToStorage(get());
  },

  openDayISO: (iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;
    const view = new Date(d.getFullYear(), d.getMonth(), 1);
    set({ viewDate: view, highlightedDateISO: iso, activeDayISO: iso, range: { start: d, end: d } });
    saveToStorage(get());
  },

  closeDay: () => {
    set({ activeDayISO: null });
    saveToStorage(get());
  },

  upsertDayNote: (iso, text) => {
    const now = Date.now();
    const trimmed = text;
    set({
      dayNotes: {
        ...get().dayNotes,
        [iso]: { iso, text: trimmed, updatedAt: now },
      },
    });
    saveToStorage(get());
  },

  upsertNoteForRange: (range, text) => {
    const { start, end } = clampRange(range.start, range.end);
    const startISO = toISODate(start);
    const endISO = toISODate(end);
    const current = get().notes;

    const existing = current.find((n) => n.startISO === startISO && n.endISO === endISO);
    const now = Date.now();
    const next = existing
      ? current.map((n) => (n.id === existing.id ? { ...n, text, updatedAt: now } : n))
      : [{ id: randomId(), startISO, endISO, text, updatedAt: now }, ...current];

    set({ notes: next });
    saveToStorage(get());
  },

  deleteNote: (id) => {
    set({ notes: get().notes.filter((n) => n.id !== id) });
    saveToStorage(get());
  },

  jumpToRangeISO: (startISO, endISO) => {
    const start = new Date(startISO);
    const end = new Date(endISO);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    get().setRange({ start, end });
  },

  jumpToQuery: (query) => {
    const q = query.trim();
    if (!q) return { ok: false, message: "Type a date, month, or year." };

    // Event name: "Diwali 2026"
    const evt = findEventByQuery(q);
    if (evt) {
      get().openDayISO(evt.dateISO);
      return { ok: true };
    }

    // Year-only: "2023"
    if (/^\d{4}$/.test(q)) {
      const year = Number(q);
      const d = new Date(year, 0, 1);
      set({ viewDate: d, highlightedDateISO: null, range: { start: null, end: null }, hoverDate: null });
      saveToStorage(get());
      return { ok: true };
    }

    // Month + year: "Jan 2022" / "January 2022" / "2022-01"
    const monthYearFormats = ["MMM yyyy", "MMMM yyyy", "yyyy-MM"];
    for (const fmt of monthYearFormats) {
      const parsed = parse(q, fmt, new Date());
      if (!Number.isNaN(parsed.getTime()) && format(parsed, fmt) === q) {
        const d = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
        set({ viewDate: d, highlightedDateISO: null });
        saveToStorage(get());
        return { ok: true };
      }
    }

    // Full date: "Jan 15, 2022" / "2022-01-15" / "1/15/2022"
    const dateFormats = ["MMM d, yyyy", "MMMM d, yyyy", "yyyy-MM-dd", "M/d/yyyy", "MM/dd/yyyy"];
    for (const fmt of dateFormats) {
      const parsed = parse(q, fmt, new Date());
      if (!Number.isNaN(parsed.getTime()) && format(parsed, fmt) === q) {
        const view = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
        const iso = toISODate(parsed);
        set({
          viewDate: view,
          highlightedDateISO: iso,
          range: { start: parsed, end: parsed },
          hoverDate: null,
        });
        saveToStorage(get());
        return { ok: true };
      }
    }

    return { ok: false, message: 'Try "Jan 15, 2022", "2022-01-15", "Jan 2022", or "2023".' };
  },
}));

export function isWithinRange(d: Date, range: DateRange, hoverDate: Date | null) {
  if (!range.start) return false;
  const start = range.start;
  const end = range.end ?? hoverDate;
  if (!end) return isSameDay(d, start);

  const { start: s, end: e } = clampRange(start, end);
  return !(isBefore(d, s) || isAfter(d, e));
}

