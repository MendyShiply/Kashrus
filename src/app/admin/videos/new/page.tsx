import { db } from "@/lib/db";
import VideoForm from "@/components/admin/VideoForm";

export default async function NewVideo({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="stack">
      <h1>Post a video</h1>
      <VideoForm categories={categories} video={{ kind: kind === "SHORT" ? "SHORT" : "LONG" }} />
    </div>
  );
}
