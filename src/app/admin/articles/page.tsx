import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ARTICLE_KINDS, ARTICLE_STATUS } from "@/lib/articles";
import { draftingEnabled } from "@/lib/drafts";
import { draftFromVideoAction, draftNewsletterAction } from "@/app/actions/drafts";
import ImportButton from "@/components/admin/ImportButton";

const TABS = ["PENDING", "DRAFT", "APPROVED"] as const;

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ s?: string; error?: string }> }) {
  const user = await requireAdmin();
  const sp = await searchParams;
  const s = TABS.includes(sp.s as (typeof TABS)[number]) ? sp.s! : "PENDING";
  const [articles, counts, videos] = await Promise.all([
    db.article.findMany({ where: { status: s }, orderBy: { updatedAt: "desc" } }),
    db.article.groupBy({ by: ["status"], _count: true }),
    db.video.findMany({ where: { transcript: { not: null } }, orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
  ]);
  const subscribers = await db.user.findMany({ where: { newsletter: true, OR: [{ status: "APPROVED" }, { role: "ADMIN" }] }, select: { email: true } });
  const count = (k: string) => counts.find((c) => c.status === k)?._count ?? 0;
  const ai = draftingEnabled();

  return (
    <div className="stack">
      <div className="spread"><h1>Articles and newsletters</h1><Link className="btn btn-outline" href="/admin/articles/new">+ Write one yourself</Link></div>
      <div className="alert alert-info">
        Nothing is posted until {user.canApprove ? "you approve it" : "the Rav approves it"}.
        {ai ? " When a shiur gets a transcript, a write up is drafted automatically and lands in “Waiting for the Rav”." : ""}
      </div>
      {sp.error && <div className="alert alert-error">{sp.error}</div>}

      {ai ? (
        <div className="grid grid-2">
          <form action={draftFromVideoAction} className="card">
            <h3>Draft from a shiur</h3>
            {videos.length === 0 ? <p className="small muted">No videos have a transcript yet.</p> : (
              <>
                <div className="field"><label htmlFor="d-video">Shiur</label>
                  <select id="d-video" name="videoId">{videos.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}</select></div>
                <div className="field"><label htmlFor="d-kind">Make a</label>
                  <select id="d-kind" name="kind"><option value="WRITEUP">Shiur write up</option><option value="ARTICLE">Article</option></select></div>
                <ImportButton label="Draft it" pendingLabel="Writing, about a minute..." />
              </>
            )}
          </form>
          <form action={draftNewsletterAction} className="card">
            <h3>Draft a newsletter</h3>
            <p className="small muted">Pulls together the shiurim and approved articles from the period you choose.</p>
            <div className="field"><label htmlFor="d-days">Covering the last</label>
              <select id="d-days" name="days" defaultValue="30"><option value="7">7 days</option><option value="14">2 weeks</option><option value="30">month</option></select></div>
            <ImportButton label="Draft newsletter" pendingLabel="Writing, about a minute..." />
          </form>
        </div>
      ) : (
        <p className="small muted">Automatic drafting is off. Add an ANTHROPIC_API_KEY to turn it on (see the README).</p>
      )}

      <details className="card small">
        <summary><strong>Newsletter email list ({subscribers.length})</strong></summary>
        <p className="muted" style={{ marginTop: 8 }}>Members who want the newsletter by email. Copy these into your email program (put them in BCC) when you send an approved issue.</p>
        <textarea readOnly style={{ minHeight: 70 }} defaultValue={subscribers.map((u) => u.email).join(", ")} />
      </details>

      <div className="row">
        {TABS.map((t) => (
          <Link key={t} href={`/admin/articles?s=${t}`} className={`btn btn-sm ${t === s ? "btn-navy" : "btn-outline"}`}>
            {t === "PENDING" ? "Waiting for the Rav" : t === "DRAFT" ? "Drafts" : "Posted"} ({count(t)})
          </Link>
        ))}
      </div>
      {articles.length === 0 ? <p className="muted">Nothing here.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>{a.title}</strong>
                    <div className="small muted">{a.updatedAt.toLocaleDateString()}{a.aiGenerated && " · drafted automatically"}</div>
                    {a.returnNotes && <div className="small" style={{ color: "var(--bad)" }}>Rav&apos;s notes: {a.returnNotes}</div>}
                  </td>
                  <td>{ARTICLE_KINDS[a.kind]}</td>
                  <td><span className={`tag ${ARTICLE_STATUS[a.status]?.cls}`}>{ARTICLE_STATUS[a.status]?.label}</span>{a.approvedBy && <div className="small muted">by {a.approvedBy}</div>}</td>
                  <td><Link className={`btn btn-sm ${a.status === "PENDING" && user.canApprove ? "btn-gold" : "btn-outline"}`} href={`/admin/articles/${a.id}`}>{a.status === "PENDING" && user.canApprove ? "Review" : "Open"}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
