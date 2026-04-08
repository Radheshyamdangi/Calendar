import { format } from "date-fns";
import type { CulturalEvent } from "../data/events";

export type HeroMedia = {
  kind: "image" | "gradient";
  // For kind=image, points at /public assets or remote URLs.
  src?: string;
  // For kind=gradient, CSS vars/strings.
  a: string;
  b: string;
  label: string;
};

// Uses local public paths if you add images later.
// You can drop images into `chronosync/public/hero/` with these names.
const MONTH_IMAGE_PATHS: Record<number, string> = {
  0: "/hero/jan.jpg",
  1: "/hero/feb.jpg",
  2: "/hero/mar.jpg",
  3: "/hero/apr.jpg",
  4: "/hero/may.jpg",
  5: "/hero/jun.jpg",
  6: "/hero/jul.jpg",
  7: "/hero/aug.jpg",
  8: "/hero/sep.jpg",
  9: "/hero/oct.jpg",
  10: "/hero/nov.jpg",
  11: "/hero/dec.jpg",
};

const MONTH_GRADIENTS: [string, string][] = [
  ["#0b1026", "#274690"], // Jan
  ["#2b0b26", "#a4133c"], // Feb
  ["#0b2620", "#2a9d8f"], // Mar
  ["#1a2a0b", "#80b918"], // Apr
  ["#0b1f2a", "#00b4d8"], // May
  ["#2a1a0b", "#ffb703"], // Jun
  ["#2a0b0b", "#fb8500"], // Jul
  ["#0b2a25", "#06d6a0"], // Aug
  ["#2a250b", "#f77f00"], // Sep
  ["#2a120b", "#d62828"], // Oct
  ["#120b2a", "#4ea8de"], // Nov
  ["#0b2a10", "#2d6a4f"], // Dec
];

function eventTint(e: CulturalEvent): [string, string] {
  switch (e.heroHint) {
    case "night":
      return ["#050814", "#4361ee"];
    case "sunrise":
      return ["#003566", "#ffd166"];
    case "festive":
      return ["#1b0b2a", "#ff8fab"];
    default:
      return ["#0b1026", "#274690"];
  }
}

export function heroForMonth(viewDate: Date): HeroMedia {
  const m = viewDate.getMonth();
  const [a, b] = MONTH_GRADIENTS[m] ?? MONTH_GRADIENTS[0];
  const src = MONTH_IMAGE_PATHS[m];
  const label = format(viewDate, "MMMM yyyy");

  // Prefer image if it exists (we can’t synchronously check file existence in a Vite-safe way),
  // so we always set both: CSS uses image if it loads, gradient is fallback.
  return { kind: "image", src, a, b, label };
}

export function heroForDay(day: Date, events: CulturalEvent[]): HeroMedia {
  if (events.length) {
    const [a, b] = eventTint(events[0]);
    return {
      kind: "gradient",
      a,
      b,
      label: events[0].name,
    };
  }
  const m = day.getMonth();
  const [a, b] = MONTH_GRADIENTS[m] ?? MONTH_GRADIENTS[0];
  return { kind: "gradient", a, b, label: format(day, "EEEE, MMM d") };
}

