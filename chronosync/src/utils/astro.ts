// Lightweight astronomy helpers (no external deps).
// Provides approximate sunrise/sunset times + moon phase.

export type SunTimes = { sunrise: Date; sunset: Date };

function dayOfYearUTC(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((now - start) / 86400000) + 1;
}

function degToRad(d: number) {
  return (d * Math.PI) / 180;
}

function radToDeg(r: number) {
  return (r * 180) / Math.PI;
}

function normalizeDegrees(d: number) {
  const x = d % 360;
  return x < 0 ? x + 360 : x;
}

// NOAA-style sunrise/sunset approximation.
// Returns Date objects in local time for the running environment.
export function getSunTimes(date: Date, lat: number, lon: number): SunTimes {
  // zenith: official sunrise/sunset
  const zenith = 90.833;

  // Work with UTC day to avoid DST issues in the math; convert result back to local.
  const N = dayOfYearUTC(date);
  const lngHour = lon / 15;

  function calc(isSunrise: boolean) {
    const t = N + ((isSunrise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L = M + 1.916 * Math.sin(degToRad(M)) + 0.02 * Math.sin(degToRad(2 * M)) + 282.634;
    L = normalizeDegrees(L);

    let RA = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L))));
    RA = normalizeDegrees(RA);

    // Put RA in the same quadrant as L
    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(degToRad(L));
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH =
      (Math.cos(degToRad(zenith)) - sinDec * Math.sin(degToRad(lat))) /
      (cosDec * Math.cos(degToRad(lat)));

    // Clamp (polar regions). If out of range, fallback to noon-ish times.
    const safeCosH = Math.min(1, Math.max(-1, cosH));
    let H = isSunrise ? 360 - radToDeg(Math.acos(safeCosH)) : radToDeg(Math.acos(safeCosH));
    H = H / 15;

    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = (UT + 24) % 24;

    // Build a Date in local time using UT hours on the same UTC date.
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    utc.setUTCHours(Math.floor(UT), Math.floor((UT % 1) * 60), 0, 0);
    return new Date(utc.getTime());
  }

  return { sunrise: calc(true), sunset: calc(false) };
}

// Moon phase fraction in [0,1), 0=new, 0.5=full.
export function getMoonPhase(date: Date) {
  // Reference new moon: 2000-01-06 18:14 UTC (approx).
  const ref = Date.UTC(2000, 0, 6, 18, 14, 0, 0);
  const synodic = 29.53058867 * 86400000;
  const t = date.getTime() - ref;
  const frac = ((t % synodic) + synodic) % synodic;
  const phase = frac / synodic;

  // Illumination fraction approximation from phase angle.
  // 0 at new, 1 at full.
  const illum = 0.5 * (1 - Math.cos(2 * Math.PI * phase));

  return { phase, illumination: illum };
}

