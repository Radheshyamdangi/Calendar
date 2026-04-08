import { useState } from "react";

export default function useDateRange() {
  const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const selectDate = (day: Date) => {
    if (!range.start) {
      setRange({ start: day, end: null });
    } else if (!range.end) {
      if (day < range.start) {
        // reset if clicked before start
        setRange({ start: day, end: null });
      } else {
        setRange({ ...range, end: day });
      }
    } else {
      // reset selection
      setRange({ start: day, end: null });
    }
  };

  return { range, selectDate };
}
