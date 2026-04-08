export type CulturalEvent = {
  name: string;
  dateISO: string; // yyyy-MM-dd
  tags: string[];
  region?: string;
  description?: string;
  heroHint?: "festive" | "seasonal" | "sunrise" | "night";
};

// Small starter dataset (expandable). Dates are curated for the demo experience.
export const CULTURAL_EVENTS: CulturalEvent[] = [
  {
    name: "Independence Day (India)",
    dateISO: "2026-08-15",
    tags: ["independence day", "india", "national holiday", "15 aug", "15 august"],
    region: "India",
    description: "Indian Independence Day.",
    heroHint: "festive",
  },
  {
    name: "Ravidas Jayanti",
    dateISO: "2026-02-01",
    tags: ["ravidas jayanti", "guru ravidas", "jayanti"],
    region: "India",
    description: "Birth anniversary observance of Guru Ravidas (date varies by year).",
    heroHint: "festive",
  },
  {
    name: "Sharad Purnima",
    dateISO: "2026-10-26",
    tags: ["sharad purnima", "purnima", "kojagari", "full moon"],
    region: "India",
    description: "Hindu festival celebrated on the full moon of Ashvin.",
    heroHint: "night",
  },
  {
    name: "Diwali",
    dateISO: "2026-11-08",
    tags: ["diwali", "deepavali", "festival of lights", "dipavali"],
    region: "India",
    description: "Festival of Lights (date varies by year).",
    heroHint: "festive",
  },
];

export function eventsForISO(iso: string) {
  return CULTURAL_EVENTS.filter((e) => e.dateISO === iso);
}

export function findEventByQuery(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Support "Diwali 2026"
  const yearMatch = q.match(/\b(19\d{2}|20\d{2}|21\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : null;
  const namePart = year ? q.replace(yearMatch![0], "").trim() : q;

  const candidates = CULTURAL_EVENTS.filter((e) => {
    const hay = [e.name.toLowerCase(), ...e.tags].join(" ");
    return hay.includes(namePart);
  });

  if (!candidates.length) return null;
  if (!year) return candidates[0];

  const exactYear = candidates.find((e) => e.dateISO.startsWith(String(year)));
  return exactYear ?? candidates[0];
}

