import { getCurrentUser, isMember } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { toEmbedUrl } from "@/lib/embed";
import MembersOnly from "@/components/MembersOnly";
import Link from "next/link";

export const metadata = { title: "Live" };
export const dynamic = "force-dynamic";

export default async function LivePage() {
  const user = await getCurrentUser();
  const member = isMember(user);
  const s = await getSettings();
  const embed = toEmbedUrl(s.liveEmbedUrl);
  const join = s.liveJoinUrl;
  const isLive = s.liveIsOn === "true";
  return (
    <div className="container section">
      <span className="eyebrow">{isLive ? <><span className="live-dot" />Live now</> : "Live shiurim"}</span>
      <h1>{s.liveTitle || "Live Shiur"}</h1>
      {s.liveSchedule && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{s.liveSchedule}</p>}
      {!member ? (
        <MembersOnly loggedIn={!!user} />
      ) : (
        <div className="stack" style={{ marginTop: 20 }}>
          {embed && (
            <div className="player">
              <iframe src={embed} title="Live" allow="autoplay; encrypted-media; picture-in-picture; fullscreen; camera; microphone" allowFullScreen />
            </div>
          )}
          {join && (
            <div className="card spread">
              <div>
                <h3>Join the live session</h3>
                <p className="muted small" style={{ margin: 0 }}>Opens Zoom or Google Meet in a new tab so you can ask questions.</p>
              </div>
              <a className="btn btn-gold" href={join} target="_blank" rel="noreferrer">Join now</a>
            </div>
          )}
          {!embed && !join && <div className="alert alert-info">There is no live session right now. The next one will be announced here.</div>}
          <p className="small muted">
            Missed a session? Recordings are posted in <Link href="/videos">Videos</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
