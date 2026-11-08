import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { VideoPlayer } from "@/components/Video";
import MembersOnly from "@/components/MembersOnly";

export const metadata = { title: "Shorts" };
export const dynamic = "force-dynamic";

export default async function ShortsPage() {
  const user = await getCurrentUser();
  const member = isMember(user);
  const shorts = member
    ? await db.video.findMany({ where: { published: true, kind: "SHORT" }, include: { category: true }, orderBy: { createdAt: "desc" } })
    : [];
  return (
    <div className="container section">
      <div className="center">
        <span className="eyebrow">Quick lessons</span>
        <h1>Shorts</h1>
        <p className="muted">One minute kashrus tips. Scroll through.</p>
      </div>
      {!member ? (
        <MembersOnly loggedIn={!!user} />
      ) : shorts.length === 0 ? (
        <div className="alert alert-info">No shorts yet. Check back soon.</div>
      ) : (
        <div className="shorts-feed">
          {shorts.map((v) => (
            <div key={v.id} className="short-item">
              <VideoPlayer v={v} />
              <h3>{v.title}</h3>
              {v.category && <span className="tag">{v.category.title}</span>}
              {v.description && <p className="muted small" style={{ marginTop: 6 }}>{v.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
