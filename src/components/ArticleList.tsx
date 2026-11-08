import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { ARTICLE_KINDS } from "@/lib/articles";
import MembersOnly from "@/components/MembersOnly";

export default async function ArticleList({ kinds, eyebrow, title, intro, empty }: { kinds: string[]; eyebrow: string; title: string; intro: string; empty: string }) {
  const user = await getCurrentUser();
  const member = isMember(user);
  const articles = member
    ? await db.article.findMany({ where: { status: "APPROVED", kind: { in: kinds } }, orderBy: { approvedAt: "desc" } })
    : [];
  return (
    <div className="container section" style={{ maxWidth: 860 }}>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="muted">{intro}</p>
      {!member ? (
        <MembersOnly loggedIn={!!user} />
      ) : articles.length === 0 ? (
        <div className="alert alert-info">{empty}</div>
      ) : (
        <div className="stack" style={{ marginTop: 20 }}>
          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.id}`} className="card">
              <div className="row small">
                <span className="tag">{ARTICLE_KINDS[a.kind]}</span>
                <span className="muted">{(a.approvedAt || a.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}</span>
              </div>
              <h3 style={{ marginTop: 8 }}>{a.title}</h3>
              <p className="muted small" style={{ margin: 0 }}>{a.body.slice(0, 220)}{a.body.length > 220 ? "..." : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
