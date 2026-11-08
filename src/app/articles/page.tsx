import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { ARTICLE_KINDS } from "@/lib/articles";
import MembersOnly from "@/components/MembersOnly";

export const metadata = { title: "Articles" };
export const dynamic = "force-dynamic";

export default async function ArticlesPage({ searchParams }: { searchParams: Promise<{ k?: string }> }) {
  const { k } = await searchParams;
  const user = await getCurrentUser();
  const member = isMember(user);
  const kind = k && ARTICLE_KINDS[k] ? k : undefined;
  const articles = member
    ? await db.article.findMany({ where: { published: true, ...(kind ? { kind } : {}) }, orderBy: { createdAt: "desc" } })
    : [];
  return (
    <div className="container section" style={{ maxWidth: 860 }}>
      <span className="eyebrow">Read</span>
      <h1>Articles and write ups</h1>
      <p className="muted">Written summaries of the shiurim, articles and newsletters.</p>
      {!member ? (
        <MembersOnly loggedIn={!!user} />
      ) : (
        <>
          <div className="row" style={{ margin: "12px 0 24px" }}>
            <Link className={`btn btn-sm ${!kind ? "btn-navy" : "btn-outline"}`} href="/articles">All</Link>
            {Object.entries(ARTICLE_KINDS).map(([key, label]) => (
              <Link key={key} className={`btn btn-sm ${kind === key ? "btn-navy" : "btn-outline"}`} href={`/articles?k=${key}`}>{label}s</Link>
            ))}
          </div>
          {articles.length === 0 ? (
            <div className="alert alert-info">Nothing here yet. Check back soon.</div>
          ) : (
            <div className="stack">
              {articles.map((a) => (
                <Link key={a.id} href={`/articles/${a.id}`} className="card">
                  <div className="row small"><span className="tag">{ARTICLE_KINDS[a.kind]}</span><span className="muted">{a.createdAt.toLocaleDateString("en-US", { dateStyle: "long" })}</span></div>
                  <h3 style={{ marginTop: 8 }}>{a.title}</h3>
                  <p className="muted small" style={{ margin: 0 }}>{a.body.slice(0, 220)}{a.body.length > 220 ? "..." : ""}</p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
