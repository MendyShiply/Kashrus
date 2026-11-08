import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import VideoForm from "@/components/admin/VideoForm";
import { deleteVideo } from "@/app/actions/admin";

export default async function EditVideo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ imported?: string }> }) {
  const { id } = await params;
  const { imported } = await searchParams;
  const [video, categories] = await Promise.all([db.video.findUnique({ where: { id } }), db.category.findMany({ orderBy: { order: "asc" } })]);
  if (!video) notFound();
  return (
    <div className="stack">
      <h1>Edit video</h1>
      {imported && <div className="alert alert-ok">Imported from Zoom as a draft. Check the title, pick a category, then tick “Published” and save.</div>}
      <VideoForm categories={categories} video={video} />
      <form action={deleteVideo}>
        <input type="hidden" name="id" value={video.id} />
        <button className="btn btn-danger btn-sm">Delete this video</button>
      </form>
    </div>
  );
}
