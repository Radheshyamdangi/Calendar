import React from "react";
import { format, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import type { CalendarCell } from "../../utils/dateUtils";
import { isWithinRange, useCalendarStore } from "../../store/calendarStore";
import { eventsForISO } from "../../data/events";

const DayCell: React.FC<{ cell: CalendarCell }> = ({ cell }) => {
  const range = useCalendarStore((s) => s.range);
  const hoverDate = useCalendarStore((s) => s.hoverDate);
  const setHoverDate = useCalendarStore((s) => s.setHoverDate);
  const onDayPress = useCalendarStore((s) => s.onDayPress);
  const highlightedDateISO = useCalendarStore((s) => s.highlightedDateISO);
  const dayNotes = useCalendarStore((s) => s.dayNotes);

  const inRange = isWithinRange(cell.date, range, hoverDate);
  const isStart = range.start ? isSameDay(cell.date, range.start) : false;
  const isEnd = range.end ? isSameDay(cell.date, range.end) : false;
  const isHighlighted = highlightedDateISO ? highlightedDateISO === cell.iso : false;
  const isHovered = hoverDate ? isSameDay(cell.date, hoverDate) : false;
  const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;

  const hasEvent = eventsForISO(cell.iso).length > 0;
  const hasNote = Boolean((dayNotes[cell.iso]?.text ?? "").trim());

  const events = isHovered ? eventsForISO(cell.iso) : [];
  const notePreview = isHovered ? (dayNotes[cell.iso]?.text ?? "").trim() : "";
  const showTooltip = isHovered && (events.length > 0 || notePreview.length > 0);

  return (
    <div className="daycell-wrap">
      <motion.button
        type="button"
        className={[
          "day-cell",
          cell.inMonth ? "in-month" : "out-month",
          isWeekend ? "weekend" : "",
          inRange ? "selected" : "",
          isStart ? "range-start" : "",
          isEnd ? "range-end" : "",
          cell.isToday ? "today" : "",
          isHighlighted ? "highlighted" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        layoutId={`day-${cell.iso}`}
        whileTap={{ scale: 0.98 }}
        onClick={() => onDayPress(cell.date)}
        onMouseEnter={() => setHoverDate(cell.date)}
        onMouseLeave={() => setHoverDate(null)}
        title={format(cell.date, "EEE, MMM d, yyyy")}
        aria-label={format(cell.date, "MMMM d, yyyy")}
      >
        {cell.label}
        <span className="day-badges" aria-hidden="true">
          {hasEvent ? <span className="badge badge-event" /> : null}
          {hasNote ? <span className="badge badge-note" /> : null}
        </span>
      </motion.button>

      {showTooltip ? (
        <div className="day-tooltip" role="status" aria-live="polite">
          {events.length ? <div className="tt-title">{events[0].name}</div> : null}
          {notePreview ? (
            <div className="tt-note">
              {notePreview.slice(0, 52)}
              {notePreview.length > 52 ? "…" : ""}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default DayCell;