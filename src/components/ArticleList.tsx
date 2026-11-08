import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { ARTICLE_KINDS } from "@/lib/articles";
import MembersOnly from "@/components/MembersOnly";
import { setNewsletterOptIn } from "@/app/actions/public";

export default async function ArticleList({ kinds, eyebrow, title, intro, empty, signup = false }: { kinds: string[]; eyebrow: string; title: string; intro: string; empty: string; signup?: boolean }) {
  const user = await getCurrentUser();
  const member = isMember(user);
  const optedIn = member && signup ? (await db.user.findUnique({ where: { id: user!.id }, select: { newsletter: true } }))?.newsletter : false;
  const articles = member
    ? await db.article.findMany({ where: { status: "APPROVED", kind: { in: kinds } }, orderBy: { approvedAt: "desc" } })
    : [];
  return (
    <div className="container section" style={{ maxWidth: 860 }}>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="muted">{intro}</p>
      {member && signup && (
        <form action={setNewsletterOptIn} className="card spread" style={{ margin: "12px 0" }}>
          <input type="hidden" name="on" value={optedIn ? "0" : "1"} />
          <div>
            <strong>{optedIn ? "You get the newsletter by email" : "Get the newsletter by email"}</strong>
            <div className="small muted">Sent to {user!.email} when a new issue is approved.</div>
          </div>
          <button className={`btn btn-sm ${optedIn ? "btn-outline" : "btn-gold"}`}>{optedIn ? "Stop emails" : "Sign me up"}</button>
        </form>
      )}
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
