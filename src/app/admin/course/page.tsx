import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { TRACKS, stripeEnabled } from "@/lib/course";
import { deleteLesson, saveLesson, saveSettings, setEnrollmentStatus } from "@/app/actions/admin";

export default async function CourseAdmin() {
  const [s, lessons, videos, enrollments, members] = await Promise.all([
    getSettings(),
    db.lesson.findMany({ orderBy: { order: "asc" } }),
    db.video.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    db.enrollment.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } }),
    db.user.count({ where: { status: "APPROVED" } }),
  ]);

  const LessonFields = ({ l }: { l?: (typeof lessons)[number] }) => (
    <>
      {l && <input type="hidden" name="id" value={l.id} />}
      <div className="grid grid-3" style={{ gap: 12 }}>
        <div className="field" style={{ gridColumn: "span 2" }}><label>Lesson title</label><input name="title" type="text" required defaultValue={l?.title} /></div>
        <div className="field"><label>Order</label><input name="order" type="number" defaultValue={l?.order ?? lessons.length + 1} /></div>
      </div>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="field">
          <label>Use a posted video</label>
          <select name="videoId" defaultValue={l?.videoId || ""}>
            <option value="">None</option>
            {videos.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}
          </select>
        </div>
        <div className="field"><label>Or a video link</label><input name="embedUrl" type="url" defaultValue={l?.embedUrl || ""} /></div>
      </div>
      <div className="field"><label>Lesson notes</label><textarea name="description" style={{ minHeight: 70 }} defaultValue={l?.description || ""} /></div>
    </>
  );

  return (
    <div className="stack">
      <h1>Course</h1>
      <div className="alert alert-info">
        You have {members} approved members. When you reach your goal (100 or 1,000), turn on enrollment below.
      </div>

      <form action={saveSettings} className="card">
        <h3>Course settings</h3>
        <input type="hidden" name="courseOpen__present" value="1" />
        <div className="field"><label className="checkbox"><input type="checkbox" name="courseOpen" defaultChecked={s.courseOpen === "true"} /> Enrollment is open</label></div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="field"><label>Course name</label><input name="courseTitle" type="text" defaultValue={s.courseTitle} /></div>
          <div className="field"><label>Price in USD (0 = free)</label><input name="coursePrice" type="number" step="0.01" min="0" defaultValue={s.coursePrice} /></div>
        </div>
        <div className="field">
          <label>The Rav&apos;s signature for certificates (photo of the signature on white paper, PNG or JPG)</label>
          <input name="founderSignature" type="file" accept="image/*" />
          {s.founderSignature && <img src={`/media/${s.founderSignature}`} alt="Signature" style={{ maxHeight: 60, marginTop: 8 }} />}
        </div>
        <p className="small muted">
          Payments: {stripeEnabled() ? "Stripe is connected; students pay by card online." : "Stripe is not connected, so new students wait until you mark them as paid below."}
        </p>
        <button className="btn btn-gold btn-sm">Save settings</button>
      </form>

      <h2>Lessons</h2>
      {lessons.map((l) => (
        <div key={l.id} className="card">
          <form action={saveLesson}><LessonFields l={l} /><button className="btn btn-navy btn-sm">Save lesson</button></form>
          <form action={deleteLesson} style={{ marginTop: 8 }}>
            <input type="hidden" name="id" value={l.id} />
            <button className="linklike small" style={{ color: "var(--bad)" }}>Delete lesson</button>
          </form>
        </div>
      ))}
      <form action={saveLesson} className="card">
        <h3>Add a lesson</h3>
        <LessonFields />
        <button className="btn btn-gold btn-sm">Add lesson</button>
      </form>

      <h2>Students</h2>
      {enrollments.length === 0 ? (
        <p className="muted">No students yet.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Track</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.user.name}</strong><div className="small">{e.user.email}</div></td>
                  <td className="small">{TRACKS[e.track]?.label}</td>
                  <td>
                    <span className={`tag ${e.status === "COMPLETED" ? "tag-ok" : e.status === "ACTIVE" ? "tag-navy" : ""}`}>
                      {e.status === "PENDING_PAYMENT" ? "awaiting payment" : e.status.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    {e.status === "PENDING_PAYMENT" && (
                      <form action={setEnrollmentStatus}>
                        <input type="hidden" name="id" value={e.id} /><input type="hidden" name="status" value="ACTIVE" />
                        <button className="btn btn-ok btn-sm">Mark paid and open course</button>
                      </form>
                    )}
                    {e.certificateCode && <Link className="btn btn-outline btn-sm" href={`/certificate/${e.certificateCode}`}>Certificate</Link>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
