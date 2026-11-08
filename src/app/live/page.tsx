import { getCurrentUser, isMember } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import MembersOnly from "@/components/MembersOnly";
import Link from "next/link";
import ZoomEmbed from "@/components/ZoomEmbed";
import { zoomEmbedEnabled } from "@/lib/zoom";
import { formatNextShiur } from "@/lib/live";
import { db } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata = { title: "Live" };
export const dynamic = "force-dynamic";

// Live shiurim run on Zoom. With the Zoom Meeting SDK connected, members watch inside the page; otherwise they open Zoom.
export default async function LivePage() {
  const user = await getCurrentUser();
  const member = isMember(user);
  const s = await getSettings();
  const join = s.liveJoinUrl;
  const isLive = s.liveIsOn === "true";
  const next = formatNextShiur(s.liveNextAt);
  const past = member
    ? await db.video.findMany({
        where: { published: true, OR: [{ zoomMeetingUuid: { not: null } }, { transcript: { not: null } }] },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, createdAt: true, transcript: true, summary: true },
      })
    : [];
  return (
    <div className="container section" style={{ maxWidth: 860 }}>
      <span className="eyebrow">{isLive ? <><span className="live-dot" />Live now on Zoom</> : "Live shiurim on Zoom"}</span>
      <h1>{s.liveTitle || "Live Shiur"}</h1>
      {next && (
        <div className="card spread" style={{ margin: "8px 0 16px" }}>
          <div>
            <span className="eyebrow">Next live shiur</span>
            <h3 style={{ margin: 0 }}>{next}</h3>
            {s.liveNextTopic && <div>{s.liveNextTopic}</div>}
            <div className="small muted">With {site.founder.name}</div>
          </div>
          {member && <a className="btn btn-outline btn-sm" href="/live/calendar.ics">Add to calendar</a>}
        </div>
      )}
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
          <h2 style={{ marginTop: 24 }}>Past sessions</h2>
          <p className="small muted">Every session is recorded and posted with its word for word transcript and a summary.</p>
          {past.length === 0 ? (
            <p className="muted">Recordings will appear here after the first live shiur.</p>
          ) : (
            <div className="stack">
              {past.map((v) => (
                <Link key={v.id} href={`/videos/${v.id}`} className="card spread">
                  <div>
                    <strong>{v.title}</strong>
                    <div className="small muted">Recorded {v.createdAt.toLocaleDateString("en-US", { dateStyle: "long" })}</div>
                  </div>
                  <div className="row small">
                    <span className="tag tag-navy">Recording</span>
                    {v.transcript && <span className="tag tag-navy">Transcript</span>}
                    {v.summary && <span className="tag tag-navy">Summary</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
