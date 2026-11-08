import { approveArticle, saveArticleDraft, submitArticle } from "@/app/actions/admin";
import { ARTICLE_KINDS } from "@/lib/articles";

type A = { id?: string; title?: string; kind?: string; body?: string; videoId?: string | null; status?: string };
type V = { id: string; title: string; summary: string | null; transcript: string | null };

export default function ArticleForm({
  article, videos, source, canApprove,
}: { article?: A; videos: { id: string; title: string }[]; source?: V | null; canApprove: boolean }) {
  const approved = article?.status === "APPROVED";
  return (
    <div className="grid" style={{ gridTemplateColumns: source ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr", alignItems: "start" }}>
      <form action={saveArticleDraft} className="card">
        {article?.id && <input type="hidden" name="id" value={article.id} />}
        <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" type="text" required defaultValue={article?.title} /></div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          <div className="field">
            <label htmlFor="kind">Type</label>
            <select id="kind" name="kind" defaultValue={article?.kind || "WRITEUP"}>
              {Object.entries(ARTICLE_KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="videoId">From the shiur (optional)</label>
            <select id="videoId" name="videoId" defaultValue={article?.videoId || ""}>
              <option value="">None</option>
              {videos.map((v) => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label htmlFor="body">Text</label><textarea id="body" name="body" style={{ minHeight: 420 }} required defaultValue={article?.body} /></div>
        <div className="row">
          {canApprove ? (
            <>
              <button className="btn btn-ok" formAction={approveArticle}>{approved ? "Save and keep posted" : "Approve and post"}</button>
              {!approved && <button className="btn btn-outline" formAction={saveArticleDraft}>Save as draft</button>}
            </>
          ) : (
            <>
              <button className="btn btn-gold" formAction={submitArticle}>Send to the Rav for approval</button>
              <button className="btn btn-outline" formAction={saveArticleDraft}>Save as draft</button>
            </>
          )}
        </div>
        {!canApprove && approved && <p className="small muted" style={{ marginTop: 8 }}>Changing a posted piece takes it down until the Rav approves it again.</p>}
      </form>
      {source && (
        <div className="stack">
          <h3>From “{source.title}”</h3>
          <p className="small muted">Check the text against what was said, and copy anything you want to add.</p>
          {source.summary && <div className="summary-box small">{source.summary}</div>}
          {source.transcript && (
            <details className="transcript" open>
              <summary>Transcript</summary>
              <div className="transcript-body">{source.transcript}</div>
            </details>
          )}
          {!source.summary && !source.transcript && <div className="alert alert-info">This video has no transcript or summary yet.</div>}
        </div>
      )}
    </div>
  );
}
