import { saveArticle } from "@/app/actions/admin";
import { ARTICLE_KINDS } from "@/lib/articles";

type A = { id?: string; title?: string; kind?: string; body?: string; videoId?: string | null; published?: boolean };
type V = { id: string; title: string; summary: string | null; transcript: string | null };

export default function ArticleForm({ article, videos, source }: { article?: A; videos: { id: string; title: string }[]; source?: V | null }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: source ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr", alignItems: "start" }}>
      <form action={saveArticle} className="card">
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
        <div className="field"><label htmlFor="body">Text</label><textarea id="body" name="body" style={{ minHeight: 380 }} required defaultValue={article?.body} /></div>
        <div className="field"><label className="checkbox"><input type="checkbox" name="published" defaultChecked={article?.published ?? false} /> Published (visible to members)</label></div>
        <button className="btn btn-gold">Save</button>
      </form>
      {source && (
        <div className="stack">
          <h3>From “{source.title}”</h3>
          <p className="small muted">Copy the parts you want into the write up.</p>
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
