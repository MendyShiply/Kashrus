// The next live shiur is stored as the local Eastern time the admin typed ("2026-11-15T20:00").
export const LIVE_TZ = "America/New_York";

export function formatNextShiur(local?: string) {
  if (!local) return null;
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  // Build the date at noon UTC just to get the weekday and month name right.
  const day = new Date(Date.UTC(y, mo - 1, d, 12));
  const date = day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
  const hour12 = ((h + 11) % 12) + 1;
  return `${date} · ${hour12}:${String(mi).padStart(2, "0")} ${h < 12 ? "AM" : "PM"} ET`;
}

export function icsStamp(local: string) {
  return local.replace(/[-:]/g, "").slice(0, 13) + "00"; // 20261115T2000 -> 20261115T200000
}
