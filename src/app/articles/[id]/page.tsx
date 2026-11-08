import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { ARTICLE_KINDS } from "@/lib/articles";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireMember();
  const { id } = await params;
  const a = await db.article.findUnique({ where: { id } });
  if (!a || (!a.published && user.role !== "ADMIN")) notFound();
  const video = a.videoId ? await db.video.findUnique({ where: { id: a.videoId }, select: { id: true, title: true } }) : null;
  return (
    <article className="container section narrow">
      <Link href="/articles" className="small">← All articles</Link>
      <div className="row small" style={{ marginTop: 16 }}>
        <span className="tag">{ARTICLE_KINDS[a.kind]}</span>
        <span className="muted">{a.createdAt.toLocaleDateString("en-US", { dateStyle: "long" })}</span>
      </div>
      <h1 style={{ marginTop: 10 }}>{a.title}</h1>
      {video && <p className="muted">From the shiur <Link href={`/videos/${video.id}`}>{video.title}</Link></p>}
      <div className="article-body">{a.body}</div>
      {user.role === "ADMIN" && <Link className="btn btn-outline btn-sm" style={{ marginTop: 24 }} href={`/admin/articles/${a.id}`}>Edit</Link>}
    </article>
  );
}
