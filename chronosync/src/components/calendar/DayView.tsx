import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format, isSameDay } from "date-fns";
import { X } from "lucide-react";
import { CULTURAL_EVENTS } from "../../data/events";
import { useCalendarStore } from "../../store/calendarStore";
import { getMoonPhase, getSunTimes } from "../../utils/astro";

const JABALPUR = { lat: 23.1815, lon: 79.9864 };

function formatTime(d: Date) {
  return format(d, "h:mm a");
}

function moonLabel(phase: number) {
  // phase: 0..1 (0=new, 0.5=full)
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.22) return "Waxing Crescent";
  if (phase < 0.28) return "First Quarter";
  if (phase < 0.47) return "Waxing Gibbous";
  if (phase < 0.53) return "Full Moon";
  if (phase < 0.72) return "Waning Gibbous";
  if (phase < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

function seasonalNote(month: number) {
  // Month-based “yearly context” for Jabalpur-style climate (lightweight heuristic).
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

function heroGradient(timeContext: "morning" | "day" | "evening" | "night", festive: boolean) {
  if (festive) return ["#1b0b2a", "#ff8fab"];
  switch (timeContext) {
    case "morning":
      return ["#003566", "#ffd166"];
    case "day":
      return ["#0b2a25", "#48cae4"];
    case "evening":
      return ["#2a120b", "#f77f00"];
    default:
      return ["#050814", "#4361ee"];
  }
}

export default function DayView() {
  const activeDayISO = useCalendarStore((s) => s.activeDayISO);
  const closeDay = useCalendarStore((s) => s.closeDay);
  const dayNotes = useCalendarStore((s) => s.dayNotes);
  const upsertDayNote = useCalendarStore((s) => s.upsertDayNote);

  const day = useMemo(() => (activeDayISO ? new Date(activeDayISO) : null), [activeDayISO]);

  const content = useMemo(() => {
    if (!day) return null;

    const today = new Date();
    const isToday = isSameDay(day, today);
    const now = new Date();

    const timeContext: "morning" | "day" | "evening" | "night" = (() => {
      const h = now.getHours();
      if (h < 6) return "night";
      if (h < 11) return "morning";
      if (h < 17) return "day";
      if (h < 20) return "evening";
      return "night";
    })();

    const times = getSunTimes(day, JABALPUR.lat, JABALPUR.lon);
    const moon = getMoonPhase(day);

    const events = CULTURAL_EVENTS.filter((e) => e.dateISO === format(day, "yyyy-MM-dd"));
    const festive = events.length > 0;
    const hero = heroGradient(timeContext, festive);
    const season = seasonalNote(day.getMonth());

    return {
      isToday,
      now,
      timeContext,
      sunrise: times.sunrise,
      sunset: times.sunset,
      moonPhase: moon.phase,
      moonFraction: moon.illumination,
      events,
      hero,
      season,
    };
  }, [day]);

  return (
    <AnimatePresence>
      {day && content ? (
        <>
          <motion.div
            className="dayview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => closeDay()}
          />

          <motion.div
            className="dayview-sheet"
            initial={{ y: 18, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.22 }}
            layoutId={`day-${activeDayISO}`}
          >
            <div
              className="dayview-hero"
              style={{
                ["--dvA" as any]: content.hero[0],
                ["--dvB" as any]: content.hero[1],
              }}
            >
              <div className="dayview-hero-top">
                <button type="button" className="icon-btn" aria-label="Close day view" onClick={() => closeDay()}>
                  <X size={18} />
                </button>
                <div className="dayview-hero-meta">
                  <div className="dayview-title">{format(day, "EEEE, MMMM d, yyyy")}</div>
                  <div className="dayview-subtitle">
                    {content.isToday ? `Now: ${format(content.now, "h:mm a")}` : "Selected day"}
                    {" · "}
                    {content.season.season} · Avg {content.season.avgC}°C (Jabalpur)
                  </div>
                </div>
              </div>
            </div>

            <div className="dayview-panels">
              <motion.div
                className="dayview-grid"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
                }}
              >
                <motion.div
                  className="dv-card"
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                >
                  <div className="dv-card-title">Astronomy</div>
                  <div className="dv-row">
                    <span>Sunrise</span>
                    <strong>{formatTime(content.sunrise)}</strong>
                  </div>
                  <div className="dv-row">
                    <span>Sunset</span>
                    <strong>{formatTime(content.sunset)}</strong>
                  </div>
                  <div className="dv-row">
                    <span>Moon</span>
                    <strong>
                      {moonLabel(content.moonPhase)} · {Math.round(content.moonFraction * 100)}%
                    </strong>
                  </div>
                </motion.div>

                <motion.div
                  className="dv-card"
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                >
                  <div className="dv-card-title">Cultural significance</div>
                  {content.events.length ? (
                    <div className="dv-events">
                      {content.events.map((e) => (
                        <div key={e.name} className="dv-event">
                          <div className="dv-event-name">{e.name}</div>
                          {e.description ? <div className="dv-event-desc">{e.description}</div> : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dv-muted">No curated events for this date yet.</div>
                  )}
                </motion.div>

                <motion.div
                  className="dv-card dv-notes"
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                >
                  <div className="dv-card-title">Your note</div>
                  <textarea
                    value={dayNotes[activeDayISO!]?.text ?? ""}
                    onChange={(e) => upsertDayNote(activeDayISO!, e.target.value)}
                    placeholder="Add something personal for this day…"
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

