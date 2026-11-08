import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ARTICLE_STATUS } from "@/lib/articles";
import ArticleForm from "@/components/admin/ArticleForm";
import { deleteArticle, returnArticle, unpublishArticle } from "@/app/actions/admin";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin();
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();
  const [videos, source] = await Promise.all([
    db.video.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    article.videoId ? db.video.findUnique({ where: { id: article.videoId }, select: { id: true, title: true, summary: true, transcript: true } }) : null,
  ]);
  const st = ARTICLE_STATUS[article.status];
  return (
    <div className="stack">
      <div className="spread">
        <h1>{article.status === "PENDING" && user.canApprove ? "Review before posting" : "Edit"}</h1>
        <span className={`tag ${st?.cls}`}>{st?.label}{article.approvedBy ? ` by ${article.approvedBy}` : ""}</span>
      </div>
      {article.aiGenerated && (
        <div className="alert alert-info">
          This was drafted automatically from the shiur&apos;s transcript. Please read it carefully against what was said before approving.
        </div>
      )}
      {article.reviewNotes && (
        <div className="card">
          <h3>Points to double check</h3>
          <p className="small" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{article.reviewNotes}</p>
        </div>
      )}
      {article.returnNotes && (
        <div className={`alert ${article.status === "DRAFT" ? "alert-error" : "alert-info"}`}>
          <strong>{article.status === "DRAFT" ? "Rav's notes:" : "Rav's earlier notes:"}</strong> {article.returnNotes}
        </div>
      )}

      <ArticleForm article={article} videos={videos} source={source} canApprove={user.canApprove} />

      {user.canApprove && article.status === "PENDING" && (
        <form action={returnArticle} className="card">
          <input type="hidden" name="id" value={article.id} />
          <h3>Not ready? Send it back</h3>
          <div className="field"><label htmlFor="returnNotes">What needs to change</label><textarea id="returnNotes" name="returnNotes" style={{ minHeight: 80 }} /></div>
          <button className="btn btn-outline btn-sm">Send back with notes</button>
        </form>
      )}
      <div className="row">
        {user.canApprove && article.status === "APPROVED" && (
          <form action={unpublishArticle}><input type="hidden" name="id" value={article.id} /><button className="btn btn-outline btn-sm">Take down</button></form>
        )}
        <form action={deleteArticle}><input type="hidden" name="id" value={article.id} /><button className="btn btn-danger btn-sm">Delete</button></form>
      </div>
    </div>
  );
}
