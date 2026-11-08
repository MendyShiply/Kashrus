import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ArticleForm from "@/components/admin/ArticleForm";
import { deleteArticle } from "@/app/actions/admin";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();
  const [videos, source] = await Promise.all([
    db.video.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    article.videoId ? db.video.findUnique({ where: { id: article.videoId }, select: { id: true, title: true, summary: true, transcript: true } }) : null,
  ]);
  return (
    <div className="stack">
      <h1>Edit</h1>
      <ArticleForm article={article} videos={videos} source={source} />
      <form action={deleteArticle}><input type="hidden" name="id" value={article.id} /><button className="btn btn-danger btn-sm">Delete</button></form>
    </div>
  );
}
