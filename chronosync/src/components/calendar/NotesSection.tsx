import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useCalendarStore } from "../../store/calendarStore";

function prettyRange(start: Date, end: Date) {
  const same = start.toDateString() === end.toDateString();
  return same ? format(start, "MMM d, yyyy") : `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

const NotesSection: React.FC = () => {
  const range = useCalendarStore((s) => s.range);
  const notes = useCalendarStore((s) => s.notes);
  const upsertNoteForRange = useCalendarStore((s) => s.upsertNoteForRange);
  const deleteNote = useCalendarStore((s) => s.deleteNote);
  const clearRange = useCalendarStore((s) => s.clearRange);
  const jumpToRangeISO = useCalendarStore((s) => s.jumpToRangeISO);

  const active = useMemo(() => {
    if (!range.start || !range.end) return null;
    return { start: range.start, end: range.end };
  }, [range.end, range.start]);

  const [draft, setDraft] = useState("");

  const existing = useMemo(() => {
    if (!active) return null;
    const startISO = format(active.start, "yyyy-MM-dd");
    const endISO = format(active.end, "yyyy-MM-dd");
    return notes.find((n) => n.startISO === startISO && n.endISO === endISO) ?? null;
  }, [active, notes]);

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h3>Notes</h3>
        {active ? (
          <button type="button" className="link-btn" onClick={clearRange}>
            Clear range
          </button>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="empty"
            className="notes-empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            Select a start and end date to attach notes to that range.
          </motion.div>
        ) : (
          <motion.div
            key={`${format(active.start, "yyyy-MM-dd")}_${format(active.end, "yyyy-MM-dd")}`}
            className="notes-editor"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notes-range">{prettyRange(active.start, active.end)}</div>
            <textarea
              value={existing ? existing.text : draft}
              onChange={(e) => {
                if (existing) upsertNoteForRange(active, e.target.value);
                else setDraft(e.target.value);
              }}
              placeholder="Add notes for this date range…"
            />
            {!existing ? (
              <div className="notes-actions">
                <button
                  type="button"
                  onClick={() => {
                    upsertNoteForRange(active, draft.trim());
                    setDraft("");
                  }}
                  disabled={!draft.trim()}
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="notes-actions">
                <button type="button" className="danger" onClick={() => deleteNote(existing.id)}>
                  Delete
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {notes.length ? (
        <div className="notes-list">
          <div className="notes-list-title">Recent ranges</div>
          {notes
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .slice(0, 6)
            .map((n) => (
              <button
                key={n.id}
                type="button"
                className="note-chip"
                title={`${n.startISO} → ${n.endISO}`}
                onClick={() => jumpToRangeISO(n.startISO, n.endISO)}
              >
                <span className="chip-range">
                  {n.startISO === n.endISO ? n.startISO : `${n.startISO}–${n.endISO}`}
                </span>
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
};

export default NotesSection;
