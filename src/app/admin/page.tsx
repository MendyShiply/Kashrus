import Link from "next/link";
import { db } from "@/lib/db";
import MemberTable from "@/components/admin/MemberTable";
import { requireAdmin } from "@/lib/auth";

export default async function AdminHome() {
  const user = await requireAdmin();
  const toApprove = await db.article.count({ where: { status: "PENDING" } });
  const [members, pendingUsers, videos, shorts, enrolled] = await Promise.all([
    db.user.count({ where: { status: "APPROVED" } }),
    db.user.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } }),
    db.video.count({ where: { kind: "LONG" } }),
    db.video.count({ where: { kind: "SHORT" } }),
    db.enrollment.count({ where: { status: { in: ["ACTIVE", "COMPLETED"] } } }),
  ]);
  const goal = members < 100 ? 100 : 1000;
  return (
    <div className="stack">
      <h1>Dashboard</h1>
      <div className="grid grid-4">
        <div className="card"><div className="stat">{members}</div><div className="muted small">Approved members (goal {goal})</div></div>
        <div className="card"><div className="stat">{pendingUsers.length}</div><div className="muted small">Waiting for approval</div></div>
        <div className="card"><div className="stat">{videos} / {shorts}</div><div className="muted small">Videos / shorts</div></div>
        <div className="card"><div className="stat">{enrolled}</div><div className="muted small">Course students</div></div>
      </div>
      {toApprove > 0 && (
        <div className="alert alert-info spread">
          <span><strong>{toApprove}</strong> {toApprove === 1 ? "piece is" : "pieces are"} waiting for {user.canApprove ? "your" : "the Rav's"} approval.</span>
          <Link className="btn btn-gold btn-sm" href="/admin/articles?s=PENDING">{user.canApprove ? "Review now" : "See them"}</Link>
        </div>
      )}
      <div className="row">
        <Link className="btn btn-gold" href="/admin/videos/new">Post a video</Link>
        <Link className="btn btn-outline" href="/admin/live">Set up a live session</Link>
      </div>
      <h2 style={{ marginTop: 20 }}>Requests to join</h2>
      {pendingUsers.length === 0 ? <p className="muted">No one is waiting right now.</p> : <MemberTable users={pendingUsers} />}
    </div>
  );
}
