import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CalendarGrid from "./CalendarGrid";
import NotesSection from "./NotesSection";
import DayView from "./DayView";
import MonthSummary from "./MonthSummary";
import { monthTitle } from "../../utils/dateUtils";
import { useCalendarStore } from "../../store/calendarStore";
import { heroForMonth } from "../../utils/hero";
import "./styles.css";

const Calendar: React.FC = () => {
  const viewDate = useCalendarStore((s) => s.viewDate);
  const prevMonth = useCalendarStore((s) => s.prevMonth);
  const nextMonth = useCalendarStore((s) => s.nextMonth);
  const jumpToQuery = useCalendarStore((s) => s.jumpToQuery);
  const highlightedDateISO = useCalendarStore((s) => s.highlightedDateISO);
  const mode = useCalendarStore((s) => s.mode);
  const setMode = useCalendarStore((s) => s.setMode);

  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  const hero = useMemo(() => heroForMonth(viewDate), [viewDate]);
  const monthName = useMemo(() => viewDate.toLocaleString(undefined, { month: "long" }), [viewDate]);
  const year = viewDate.getFullYear();

  return (
    <div className="calendar-container">
      <div className="calendar-topbar">
        <div className="calendar-nav">
          <button className="nav-btn nav-btn-prev" onClick={prevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <div className="month-title">{monthTitle(viewDate)}</div>
          <button className="nav-btn nav-btn-next" onClick={nextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <form
          className="calendar-search"
          onSubmit={(e) => {
            e.preventDefault();
            const res = jumpToQuery(search);
            setSearchError(res.ok ? null : res.message ?? "Invalid search.");
          }}
        >
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (searchError) setSearchError(null);
            }}
            placeholder='Search: "Jan 15, 2022" / "Jan 2022" / "2023"'
            aria-label="Search dates"
          />
          <button type="submit">Go</button>
        </form>

        <div className="calendar-mode" role="group" aria-label="Selection mode">
          <button
            type="button"
            className={["mode-btn", mode === "day" ? "active" : ""].filter(Boolean).join(" ")}
            onClick={() => setMode("day")}
            title="Click a date to open full Day View"
          >
            Day
          </button>
          <button
            type="button"
            className={["mode-btn", mode === "range" ? "active" : ""].filter(Boolean).join(" ")}
            onClick={() => setMode("range")}
            title="Click start then end to select a range"
          >
            Range
          </button>
        </div>
      </div>

      <div className="calendar-main">
        <div
          className="calendar-hero"
          style={{
            ["--heroA" as any]: hero.a,
            ["--heroB" as any]: hero.b,
            ["--heroImg" as any]: hero.src ? `url("${hero.src}")` : "none",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`ribbon-${viewDate.getFullYear()}-${viewDate.getMonth()}`}
              className="month-ribbon"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              aria-hidden="true"
            >
              <div className="mr-year">{year}</div>
              <div className="mr-month">{monthName}</div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
              className="hero-surface"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <div className="hero-title">{monthTitle(viewDate)}</div>
              <div className="hero-subtitle">Tap dates to paint the story. Swipe on mobile to change months.</div>
              <MonthSummary viewDate={viewDate} />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {highlightedDateISO ? (
              <motion.div
                key={highlightedDateISO}
                className="hero-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            ) : null}
          </AnimatePresence>
        </div>

        <div className="calendar-panels">
          <CalendarGrid />
          <NotesSection />
        </div>
      </div>

      {searchError ? <div className="calendar-error" role="alert">{searchError}</div> : null}

      <DayView />
    </div>
  );
};

export default Calendar;
