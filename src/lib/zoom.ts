import "server-only";
import { SignJWT } from "jose";

/* ---------- Embedded meetings (Meeting SDK) ---------- */

export function zoomEmbedEnabled() {
  return !!(process.env.ZOOM_SDK_KEY && process.env.ZOOM_SDK_SECRET);
}

/** Pulls the meeting number and passcode out of a normal Zoom invite link. */
export function parseZoomLink(link?: string | null) {
  if (!link) return null;
  try {
    const u = new URL(link);
    const m = u.pathname.match(/\/(?:j|wc\/join|w)\/(\d{9,12})/);
    return m ? { meetingNumber: m[1], pwd: u.searchParams.get("pwd") || "" } : null;
  } catch {
    return null;
  }
}

/** Meeting SDK signature. Role 0 = attendee. See https://developers.zoom.us/docs/meeting-sdk/auth/ */
export async function meetingSignature(meetingNumber: string, role: 0 | 1 = 0) {
  const key = process.env.ZOOM_SDK_KEY!;
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  return new SignJWT({ appKey: key, sdkKey: key, mn: meetingNumber, role, iat, exp, tokenExp: exp, video_webrtc_mode: 1 })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(new TextEncoder().encode(process.env.ZOOM_SDK_SECRET!));
}

/* ---------- Cloud recordings, transcripts and summaries (REST API) ---------- */

export function zoomApiEnabled() {
  return !!(process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET);
}

let cached: { token: string; until: number } | null = null;

export async function zoomToken() {
  if (cached && cached.until > Date.now()) return cached.token;
  const basic = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(process.env.ZOOM_ACCOUNT_ID!)}`,
    { method: "POST", headers: { Authorization: `Basic ${basic}` }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Zoom login failed (${res.status}). Check the ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET settings.`);
  const j = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: j.access_token, until: Date.now() + (j.expires_in - 120) * 1000 };
  return j.access_token;
}

export async function zoomGet<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.zoom.us/v2${path}`, {
    headers: { Authorization: `Bearer ${await zoomToken()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Zoom request failed (${res.status}) for ${path}`);
  return res.json() as Promise<T>;
}

export type ZoomFile = { id: string; file_type: string; file_extension: string; recording_type: string; download_url: string; file_size: number; status: string };
export type ZoomMeeting = { uuid: string; id: number; topic: string; start_time: string; duration: number; recording_files?: ZoomFile[] };

export async function listRecordings(days = 30) {
  const to = new Date();
  const from = new Date(Date.now() - days * 86400000);
  const d = (x: Date) => x.toISOString().slice(0, 10);
  const j = await zoomGet<{ meetings: ZoomMeeting[] }>(`/users/me/recordings?page_size=50&from=${d(from)}&to=${d(to)}`);
  return j.meetings || [];
}

/** UUIDs that start with "/" or contain "//" must be double encoded for the Zoom API. */
export function encodeUuid(uuid: string) {
  const once = encodeURIComponent(uuid);
  return uuid.startsWith("/") || uuid.includes("//") ? encodeURIComponent(once) : once;
}

export async function getMeetingSummary(uuid: string): Promise<string | null> {
  try {
    const s = await zoomGet<{ summary_overview?: string; summary_details?: { label?: string; summary?: string }[]; next_steps?: string[]; summary_content?: string }>(
      `/meetings/${encodeUuid(uuid)}/meeting_summary`,
    );
    if (s.summary_content) return s.summary_content;
    const parts = [s.summary_overview, ...(s.summary_details || []).map((d) => (d.label ? `${d.label}\n${d.summary || ""}` : d.summary || ""))];
    if (s.next_steps?.length) parts.push("Next steps\n" + s.next_steps.map((n) => `• ${n}`).join("\n"));
    const text = parts.filter(Boolean).join("\n\n").trim();
    return text || null;
  } catch {
    return null; // Summaries need Zoom AI Companion turned on; a missing summary should not block the import.
  }
}

export async function downloadZoomFile(url: string) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${await zoomToken()}` }, redirect: "follow", cache: "no-store" });
  if (!res.ok || !res.body) throw new Error(`Could not download the recording (${res.status})`);
  return res;
}
