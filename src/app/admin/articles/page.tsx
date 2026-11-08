import Link from "next/link";
import { db } from "@/lib/db";
import { ARTICLE_KINDS } from "@/lib/articles";

export default async function ArticlesAdmin() {
  const articles = await db.article.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="stack">
      <div className="spread"><h1>Articles and write ups</h1><Link className="btn btn-gold" href="/admin/articles/new">+ New</Link></div>
      <p className="muted small">Tip: open any shiur with a transcript and click “Start a write up from this shiur” to write next to the transcript.</p>
      {articles.length === 0 ? <p className="muted">Nothing written yet.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/articles/${a.id}`}>{a.title}</Link><div className="small muted">{a.createdAt.toLocaleDateString()}</div></td>
                  <td>{ARTICLE_KINDS[a.kind]}</td>
                  <td>{a.published ? <span className="tag tag-ok">published</span> : <span className="tag">draft</span>}</td>
                  <td><Link className="btn btn-outline btn-sm" href={`/admin/articles/${a.id}`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
