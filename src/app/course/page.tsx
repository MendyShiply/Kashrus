import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { site } from "@/lib/site";
import { TRACKS } from "@/lib/course";
import { enroll } from "@/app/actions/course";

export const metadata = { title: "Mashgiach Course" };
export const dynamic = "force-dynamic";

export default async function CoursePage({ searchParams }: { searchParams: Promise<{ pending?: string }> }) {
  const { pending } = await searchParams;
  const [user, s, rabbis, lessons] = await Promise.all([
    getCurrentUser(),
    getSettings(),
    db.rabbi.findMany({ orderBy: { order: "asc" } }),
    db.lesson.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
  ]);
  const member = isMember(user);
  const open = s.courseOpen === "true";
  const price = parseFloat(s.coursePrice || "0");
  const enrollment = user ? await db.enrollment.findFirst({ where: { userId: user.id } }) : null;

  return (
    <>
      <section className="hero" style={{ padding: "64px 0" }}>
        <div className="container">
          <span className="eyebrow">{open ? "Now enrolling" : "Coming soon"}</span>
          <h1>{s.courseTitle || "Mashgiach Training Course"}</h1>
          <p className="lead">
            Learn from {site.founder.name} how to supervise kashrus properly: for restaurants, bakeries, catering and
            events, or for your own home. Complete the course and receive a certificate signed by the Rav and the
            rabbanim who approve the program.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "start" }}>
            <div className="stack">
              <h2>Two tracks</h2>
              {Object.entries(TRACKS).map(([k, t]) => (
                <div className="card" key={k}><h3>{t.label}</h3></div>
              ))}
              {lessons.length > 0 && (
                <>
                  <h2 style={{ marginTop: 28 }}>Course outline</h2>
                  <ol>{lessons.map((l) => <li key={l.id}>{l.title}</li>)}</ol>
                </>
              )}
            </div>

            <div className="card">
              {pending && <div className="alert alert-info">Your enrollment is saved. We will contact you to arrange payment and then open the course for you.</div>}
              {enrollment && enrollment.status !== "PENDING_PAYMENT" ? (
                <>
                  <h3>You are enrolled</h3>
                  <Link className="btn btn-gold" href="/course/learn">Go to the course</Link>
                </>
              ) : !open ? (
                <>
                  <h3>Enrollment opens soon</h3>
                  <p className="muted">The course will open once the community has grown. Members will be the first to know.</p>
                  <Link className="btn btn-outline" href="/contact">Register interest</Link>
                </>
              ) : !member ? (
                <>
                  <h3>For members</h3>
                  <p className="muted">The course is open to approved members of the community.</p>
                  <Link className="btn btn-gold" href={user ? "/pending" : "/signup"}>{user ? "Check my status" : "Request to join"}</Link>
                </>
              ) : (
                <form action={enroll}>
                  <h3>Enroll</h3>
                  {price > 0 && <div className="stat" style={{ margin: "8px 0 16px" }}>${price.toFixed(2)}</div>}
                  <div className="field">
                    <label htmlFor="track">Choose a track</label>
                    <select id="track" name="track" defaultValue={enrollment?.track || "HOME"}>
                      {Object.entries(TRACKS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
                    </select>
                  </div>
                  <button className="btn btn-gold" style={{ width: "100%" }}>{price > 0 ? "Enroll and pay" : "Enroll"}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#f3efe4" }}>
        <div className="container">
          <span className="eyebrow">הסכמות</span>
          <h2>Rabbinic approval</h2>
          <p className="muted">The course is given with the approval of the following rabbanim.</p>
          {rabbis.length === 0 ? (
            <div className="alert alert-info">Haskamos will be listed here.</div>
          ) : (
            <div className="grid grid-3" style={{ marginTop: 20 }}>
              {rabbis.map((r) => (
                <div key={r.id} className="card rabbi-card">
                  <h3>{r.name}</h3>
                  {r.hebrewName && <div className="he" style={{ textAlign: "left" }}>{r.hebrewName}</div>}
                  <div className="muted small">{[r.title, r.community].filter(Boolean).join(", ")}</div>
                  {r.letter && <p className="small" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{r.letter}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
