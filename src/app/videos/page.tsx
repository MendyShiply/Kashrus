import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { VideoCard } from "@/components/Video";
import MembersOnly from "@/components/MembersOnly";

export const metadata = { title: "Videos" };
export const dynamic = "force-dynamic";

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const user = await getCurrentUser();
  const member = isMember(user);
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  const active = categories.find((x) => x.slug === c);
  const videos = member
    ? await db.video.findMany({
        where: { published: true, kind: "LONG", ...(active ? { categoryId: active.id } : {}) },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      })
    : [];
  return (
    <div className="container section">
      <span className="eyebrow">Long form</span>
      <h1>Videos and shiurim</h1>
      {!member ? (
        <MembersOnly loggedIn={!!user} />
      ) : (
        <>
          <div className="row" style={{ margin: "16px 0 28px" }}>
            <Link className={`btn btn-sm ${!active ? "btn-navy" : "btn-outline"}`} href="/videos">All</Link>
            {categories.map((x) => (
              <Link key={x.id} className={`btn btn-sm ${active?.id === x.id ? "btn-navy" : "btn-outline"}`} href={`/videos?c=${x.slug}`}>
                {x.title.replace(/^Common Issues (in|at) (the )?/i, "")}
              </Link>
            ))}
          </div>
          {videos.length === 0 ? (
            <div className="alert alert-info">No videos here yet. Check back soon.</div>
          ) : (
            <div className="grid grid-3">{videos.map((v) => <VideoCard key={v.id} v={v} />)}</div>
          )}
        </>
      )}
    </div>
  );
}
