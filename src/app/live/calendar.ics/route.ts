import { getCurrentUser, isMember } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { LIVE_TZ, icsStamp } from "@/lib/live";
import { site } from "@/lib/site";

// "Add to calendar" for the next live shiur. Members only, because it contains the Zoom link.
export async function GET() {
  if (!isMember(await getCurrentUser())) return new Response("Members only", { status: 403 });
  const s = await getSettings();
  if (!s.liveNextAt) return new Response("No shiur scheduled", { status: 404 });
  const start = icsStamp(s.liveNextAt);
  const mins = parseInt(s.liveNextMinutes || "60") || 60;
  const [y, mo, d, h, mi] = s.liveNextAt.match(/\d+/g)!.map(Number);
  const endDate = new Date(Date.UTC(y, mo - 1, d, h, mi + mins));
  const end = endDate.toISOString().replace(/[-:]/g, "").slice(0, 15);
  const url = (process.env.SITE_URL || "") + "/live";
  const esc = (t: string) => t.replace(/[\\,;]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
  const title = s.liveNextTopic ? `${site.name}: ${s.liveNextTopic}` : `${site.name} live shiur`;
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${site.name}//Live//EN`, "BEGIN:VEVENT",
    `UID:${start}@mishmeres-hakashrus`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=${LIVE_TZ}:${start}`,
    `DTEND;TZID=${LIVE_TZ}:${end}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(`With ${site.founder.name}. Watch at ${url}` + (s.liveJoinUrl ? `\nZoom: ${s.liveJoinUrl}` : ""))}`,
    `LOCATION:${esc(url)}`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="live-shiur.ics"' },
  });
}
