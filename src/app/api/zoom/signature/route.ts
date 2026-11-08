import { getCurrentUser, isMember } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { meetingSignature, parseZoomLink, zoomEmbedEnabled } from "@/lib/zoom";

// Gives an approved member what the browser needs to join the current Zoom shiur inside the site.
export async function POST() {
  const user = await getCurrentUser();
  if (!isMember(user)) return Response.json({ error: "Members only" }, { status: 403 });
  if (!zoomEmbedEnabled()) return Response.json({ error: "Zoom is not connected" }, { status: 400 });
  const s = await getSettings();
  const parsed = parseZoomLink(s.liveJoinUrl);
  const meetingNumber = (s.liveMeetingId || "").replace(/\D/g, "") || parsed?.meetingNumber;
  if (!meetingNumber) return Response.json({ error: "No Zoom meeting is set up right now" }, { status: 400 });
  return Response.json({
    signature: await meetingSignature(meetingNumber, 0),
    meetingNumber,
    password: s.livePasscode || "",
    userName: user!.name,
    userEmail: user!.email,
  });
}
