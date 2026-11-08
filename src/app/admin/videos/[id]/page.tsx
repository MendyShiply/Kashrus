import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import VideoForm from "@/components/admin/VideoForm";
import { deleteVideo } from "@/app/actions/admin";

export default async function EditVideo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [video, categories] = await Promise.all([db.video.findUnique({ where: { id } }), db.category.findMany({ orderBy: { order: "asc" } })]);
  if (!video) notFound();
  return (
    <div className="stack">
      <h1>Edit video</h1>
      <VideoForm categories={categories} video={video} />
      <form action={deleteVideo}>
        <input type="hidden" name="id" value={video.id} />
        <button className="btn btn-danger btn-sm">Delete this video</button>
      </form>
    </div>
  );
}
