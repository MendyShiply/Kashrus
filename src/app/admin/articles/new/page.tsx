import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import ArticleForm from "@/components/admin/ArticleForm";

export default async function NewArticle({ searchParams }: { searchParams: Promise<{ video?: string }> }) {
  const user = await requireAdmin();
  const { video } = await searchParams;
  const [videos, source] = await Promise.all([
    db.video.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    video ? db.video.findUnique({ where: { id: video }, select: { id: true, title: true, summary: true, transcript: true } }) : null,
  ]);
  return (
    <div className="stack">
      <h1>New write up</h1>
      <ArticleForm
        canApprove={user.canApprove}
        videos={videos}
        source={source}
        article={source ? { title: `Write up: ${source.title}`, kind: "WRITEUP", videoId: source.id, body: source.summary || "" } : undefined}
      />
    </div>
  );
}
