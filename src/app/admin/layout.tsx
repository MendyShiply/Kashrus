import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [pending, messages, toApprove] = await Promise.all([
    db.user.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.article.count({ where: { status: "PENDING" } }),
  ]);
  return (
    <div className="container admin-shell">
      <nav className="admin-nav">
        <Link href="/admin"><strong>Dashboard</strong></Link>
        <Link href="/admin/members">Members {pending > 0 && <span className="tag">{pending} waiting</span>}</Link>
        <Link href="/admin/videos">Videos and shorts</Link>
        <Link href="/admin/videos/new">+ Post a video</Link>
        <Link href="/admin/categories">Categories</Link>
        <Link href="/admin/live">Live on Zoom</Link>
        <Link href="/admin/zoom">Zoom recordings</Link>
        <Link href="/admin/articles">Articles and newsletters {toApprove > 0 && <span className="tag">{toApprove} to approve</span>}</Link>
        <Link href="/admin/messages">Messages {messages > 0 && <span className="tag">{messages}</span>}</Link>
        <Link href="/admin/course">Course</Link>
        <Link href="/admin/rabbis">Rabbis and haskamos</Link>
      </nav>
      <div>{children}</div>
    </div>
  );
}
