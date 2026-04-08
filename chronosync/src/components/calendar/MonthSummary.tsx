import React, { useMemo } from "react";
import { format } from "date-fns";
import { CULTURAL_EVENTS } from "../../data/events";
import { useCalendarStore } from "../../store/calendarStore";

function seasonalLabel(month: number) {
  const avgC = [18, 21, 27, 33, 38, 33, 28, 27, 27, 26, 22, 18][month] ?? 26;
  const season =
    month <= 1 || month === 11
      ? "Winter"
      : month <= 3
        ? "Spring"
        : month <= 5
          ? "Summer"
          : month <= 8
            ? "Monsoon"
            : "Autumn";
  return { avgC, season };
}

export default function MonthSummary({ viewDate }: { viewDate: Date }) {
  const dayNotes = useCalendarStore((s) => s.dayNotes);
  const rangeNotes = useCalendarStore((s) => s.notes);

  const monthISO = format(viewDate, "yyyy-MM");
  const monthEvents = useMemo(
    () => CULTURAL_EVENTS.filter((e) => e.dateISO.startsWith(monthISO)),
    [monthISO]
  );
  const monthNoteDays = useMemo(() => {
    const keys = Object.keys(dayNotes);
    return keys.filter((k) => k.startsWith(monthISO)).length;
  }, [dayNotes, monthISO]);

  const stats = useMemo(() => {
    const s = seasonalLabel(viewDate.getMonth());
    return {
      season: s.season,
      avgC: s.avgC,
      events: monthEvents.length,
      dayNotes: monthNoteDays,
      rangeNotes: rangeNotes.length,
    };
  }, [monthEvents.length, monthNoteDays, rangeNotes.length, viewDate]);

  return (
    <div className="month-summary" aria-label="Month summary">
      <div className="month-summary-row">
        <span className="ms-chip">
          <span className="ms-dot ms-dot-season" />
          {stats.season} · Avg {stats.avgC}°C
        </span>
        <span className="ms-chip">
          <span className="ms-dot ms-dot-event" />
          {stats.events} event{stats.events === 1 ? "" : "s"}
        </span>
      </div>
      <div className="month-summary-row">
        <span className="ms-chip">
          <span className="ms-dot ms-dot-note" />
          {stats.dayNotes} noted day{stats.dayNotes === 1 ? "" : "s"}
        </span>
        <span className="ms-chip ms-chip-muted">{stats.rangeNotes} range note{stats.rangeNotes === 1 ? "" : "s"}</span>
      </div>

      {monthEvents[0] ? <div className="ms-peek">Next: {monthEvents[0].name}</div> : null}
    </div>
  );
}

