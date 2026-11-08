import Link from "next/link";
import { db } from "@/lib/db";
import MemberTable from "@/components/admin/MemberTable";
import { requireAdmin } from "@/lib/auth";

const TABS = ["PENDING", "APPROVED", "REJECTED"] as const;

export default async function MembersAdmin({ searchParams }: { searchParams: Promise<{ s?: string; q?: string }> }) {
  const me = await requireAdmin();
  const sp = await searchParams;
  const s = TABS.includes(sp.s as (typeof TABS)[number]) ? sp.s! : "PENDING";
  const q = sp.q?.trim();
  const users = await db.user.findMany({
    where: { status: s, ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { city: { contains: q } }] } : {}) },
    orderBy: { createdAt: "desc" },
  });
  const counts = await db.user.groupBy({ by: ["status"], _count: true });
  const count = (k: string) => counts.find((c) => c.status === k)?._count ?? 0;
  return (
    <div className="stack">
      <h1>Members</h1>
      <div className="spread">
        <div className="row">
          {TABS.map((t) => (
            <Link key={t} href={`/admin/members?s=${t}`} className={`btn btn-sm ${t === s ? "btn-navy" : "btn-outline"}`}>
              {t === "PENDING" ? "Waiting" : t === "APPROVED" ? "Accepted" : "Rejected"} ({count(t)})
            </Link>
          ))}
        </div>
        <form className="row">
          <input type="hidden" name="s" value={s} />
          <input type="text" name="q" placeholder="Search name, email, city" defaultValue={q} style={{ width: 240 }} />
        </form>
      </div>
      {users.length === 0 ? <p className="muted">No one here.</p> : <MemberTable users={users} full viewerCanApprove={me.canApprove} />}
    </div>
  );
}
