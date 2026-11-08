import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";

export const metadata = { title: "My course" };
export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const user = await requireMember();
  const enrollment = await db.enrollment.findFirst({ where: { userId: user.id } });
  if (!enrollment || enrollment.status === "PENDING_PAYMENT") redirect("/course");
  const [lessons, done] = await Promise.all([
    db.lesson.findMany({ orderBy: { order: "asc" } }),
    db.lessonProgress.findMany({ where: { userId: user.id }, select: { lessonId: true } }),
  ]);
  const doneSet = new Set(done.map((d) => d.lessonId));
  const pct = lessons.length ? Math.round((doneSet.size / lessons.length) * 100) : 0;
  return (
    <div className="container section narrow">
      <span className="eyebrow">My course</span>
      <h1>Your progress: {pct}%</h1>
      <div style={{ height: 10, background: "#e6e1d4", borderRadius: 99, overflow: "hidden", margin: "8px 0 28px" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)" }} />
      </div>
      {enrollment.status === "COMPLETED" && enrollment.certificateCode && (
        <div className="alert alert-ok spread">
          <span>Mazel tov! You have completed the course.</span>
          <Link className="btn btn-ok btn-sm" href={`/certificate/${enrollment.certificateCode}`}>View certificate</Link>
        </div>
      )}
      {lessons.length === 0 ? (
        <div className="alert alert-info">Lessons are being prepared and will appear here.</div>
      ) : (
        <div className="stack">
          {lessons.map((l, i) => (
            <Link key={l.id} href={`/course/learn/${l.id}`} className="card spread">
              <div className="row">
                <div className="cat-num" style={{ fontSize: "1.2rem" }}>{i + 1}</div>
                <strong>{l.title}</strong>
              </div>
              {doneSet.has(l.id) ? <span className="tag tag-ok">Done</span> : <span className="tag tag-navy">Start</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
