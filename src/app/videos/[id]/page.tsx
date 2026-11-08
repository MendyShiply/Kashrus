import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { VideoCard, VideoPlayer } from "@/components/Video";
import { draftingEnabled } from "@/lib/drafts";
import { draftFromVideoAction } from "@/app/actions/drafts";
import ImportButton from "@/components/admin/ImportButton";

export const dynamic = "force-dynamic";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireMember();
  const { id } = await params;
  const v = await db.video.findUnique({ where: { id }, include: { category: true } });
  if (!v || (!v.published && user.role !== "ADMIN")) notFound();
  const articles = await db.article.findMany({ where: { videoId: v.id, status: "APPROVED" }, select: { id: true, title: true } });
  const related = await db.video.findMany({
    where: { published: true, id: { not: v.id }, categoryId: v.categoryId ?? undefined, kind: v.kind },
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: v.kind === "SHORT" ? 4 : 3,
  });
  return (
    <div className="container section">
      <div style={{ maxWidth: v.kind === "SHORT" ? 520 : 960, margin: "0 auto" }}>
        <VideoPlayer v={v} />
        <div style={{ marginTop: 20 }}>
          <div className="row small">
            {v.category && <Link className="tag" href={`/categories/${v.category.slug}`}>{v.category.title}</Link>}
            <span className="muted">{v.createdAt.toLocaleDateString("en-US", { dateStyle: "long" })}</span>
          </div>
          <h1 style={{ fontSize: "1.9rem", marginTop: 10 }}>{v.title}</h1>
          {v.description && <p style={{ whiteSpace: "pre-wrap" }}>{v.description}</p>}
          {v.summary && (
            <div style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: "1.3rem" }}>Summary</h2>
              <div className="summary-box">{v.summary}</div>
            </div>
          )}
          {v.transcript && (
            <details className="transcript" style={{ marginTop: 16 }}>
              <summary>Full transcript (word for word)</summary>
              <div className="transcript-body">{v.transcript}</div>
            </details>
          )}
          {articles.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h2 style={{ fontSize: "1.3rem" }}>Write ups from this shiur</h2>
              <ul>{articles.map((a) => <li key={a.id}><Link href={`/articles/${a.id}`}>{a.title}</Link></li>)}</ul>
            </div>
          )}
          {user.role === "ADMIN" && (
            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn btn-outline btn-sm" href={`/admin/videos/${v.id}`}>Edit video</Link>
              <Link className="btn btn-outline btn-sm" href={`/admin/articles/new?video=${v.id}`}>Write it up myself</Link>
              {v.transcript && draftingEnabled() && (
                <form action={draftFromVideoAction}>
                  <input type="hidden" name="videoId" value={v.id} />
                  <input type="hidden" name="kind" value="ARTICLE" />
                  <ImportButton label="Draft an article from this shiur" pendingLabel="Writing, about a minute..." />
                </form>
              )}
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2>More like this</h2>
          <div className={`grid ${v.kind === "SHORT" ? "grid-4" : "grid-3"}`}>{related.map((r) => <VideoCard key={r.id} v={r} />)}</div>
        </div>
      )}
    </div>
  );
}
