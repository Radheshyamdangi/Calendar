import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayCell from "./DayCell";
import { getCalendarMonthGrid } from "../../utils/dateUtils";
import { useCalendarStore } from "../../store/calendarStore";

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarGrid: React.FC = () => {
  const viewDate = useCalendarStore((s) => s.viewDate);
  const prevMonth = useCalendarStore((s) => s.prevMonth);
  const nextMonth = useCalendarStore((s) => s.nextMonth);

  const cells = getCalendarMonthGrid(viewDate, 0);

  return (
    <div className="calendar-grid-wrap">
      <button type="button" className="grid-nav grid-nav-left" onClick={prevMonth} aria-label="Previous month">
        <ChevronLeft size={22} />
      </button>
      <button type="button" className="grid-nav grid-nav-right" onClick={nextMonth} aria-label="Next month">
        <ChevronRight size={22} />
      </button>

      <div className="calendar-dow">
        {DOW.map((d) => (
          <div key={d} className="dow-cell">
            {d}
          </div>
        ))}
      </div>

      <motion.div
        key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
        className="calendar-grid"
        role="grid"
        aria-label="Calendar grid"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.08}
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 }}
        transition={{ duration: 0.22 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) nextMonth();
          if (info.offset.x > 70) prevMonth();
        }}
      >
        {cells.map((cell) => (
          <DayCell key={cell.key} cell={cell} />
        ))}
      </motion.div>
    </div>
  );
};

export default CalendarGrid;
