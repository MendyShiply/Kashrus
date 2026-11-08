import { getCurrentUser, isMember } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import MembersOnly from "@/components/MembersOnly";
import Link from "next/link";
import ZoomEmbed from "@/components/ZoomEmbed";
import { zoomEmbedEnabled } from "@/lib/zoom";

export const metadata = { title: "Live" };
export const dynamic = "force-dynamic";

// Live shiurim run on Zoom. With the Zoom Meeting SDK connected, members watch inside the page; otherwise they open Zoom.
export default async function LivePage() {
  const user = await getCurrentUser();
  const member = isMember(user);
  const s = await getSettings();
  const join = s.liveJoinUrl;
  const isLive = s.liveIsOn === "true";
  return (
    <div className="container section" style={{ maxWidth: 860 }}>
      <span className="eyebrow">{isLive ? <><span className="live-dot" />Live now on Zoom</> : "Live shiurim on Zoom"}</span>
      <h1>{s.liveTitle || "Live Shiur"}</h1>
      {s.liveSchedule && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{s.liveSchedule}</p>}
      {!member ? (
        <MembersOnly loggedIn={!!user} />
      ) : (
        <div className="stack" style={{ marginTop: 20 }}>
          {join && zoomEmbedEnabled() ? (
            <>
              <ZoomEmbed joinUrl={join} />
              {(s.liveMeetingId || s.livePasscode) && (
                <p className="small muted">
                  {s.liveMeetingId && <>Meeting ID: <strong>{s.liveMeetingId}</strong></>}
                  {s.liveMeetingId && s.livePasscode && " · "}
                  {s.livePasscode && <>Passcode: <strong>{s.livePasscode}</strong></>}
                </p>
              )}
            </>
          ) : join ? (
            <div className="card spread">
              <div>
                <h3>{isLive ? "The shiur is live now" : "Join the Zoom shiur"}</h3>
                <p className="muted small" style={{ margin: 0 }}>Opens Zoom so you can watch and ask questions.</p>
                {(s.liveMeetingId || s.livePasscode) && (
                  <p className="small" style={{ margin: "8px 0 0" }}>
                    {s.liveMeetingId && <>Meeting ID: <strong>{s.liveMeetingId}</strong></>}
                    {s.liveMeetingId && s.livePasscode && " · "}
                    {s.livePasscode && <>Passcode: <strong>{s.livePasscode}</strong></>}
                  </p>
                )}
              </div>
              <a className="btn btn-gold" href={join} target="_blank" rel="noreferrer">Join on Zoom</a>
            </div>
          ) : (
            <div className="alert alert-info">There is no live session right now. The next one will be announced here.</div>
          )}
          <p className="small muted">
            Every session is recorded, with a full transcript and summary. Missed one? Find it in <Link href="/videos">Videos</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
