import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { VideoCard } from "@/components/Video";
import MembersOnly from "@/components/MembersOnly";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();
  const user = await getCurrentUser();
  const member = isMember(user);
  const videos = member
    ? await db.video.findMany({ where: { categoryId: category.id, published: true }, include: { category: true }, orderBy: { createdAt: "desc" } })
    : [];
  const long = videos.filter((v) => v.kind === "LONG");
  const shorts = videos.filter((v) => v.kind === "SHORT");

  return (
    <div className="container section">
      <span className="eyebrow">Category</span>
      <h1>{category.title}</h1>
      {category.hebrew && <div className="he muted" style={{ fontSize: "1.3rem", textAlign: "left" }}>{category.hebrew}</div>}
      <p className="muted" style={{ maxWidth: 720 }}>{category.description}</p>
      <div style={{ marginTop: 28 }}>
        {!member ? (
          <MembersOnly loggedIn={!!user} />
        ) : videos.length === 0 ? (
          <div className="alert alert-info">Videos for this topic are coming soon.</div>
        ) : (
          <>
            {long.length > 0 && <div className="grid grid-3">{long.map((v) => <VideoCard key={v.id} v={v} />)}</div>}
            {shorts.length > 0 && (
              <>
                <h2 style={{ marginTop: 40 }}>Shorts</h2>
                <div className="grid grid-4">{shorts.map((v) => <VideoCard key={v.id} v={v} />)}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
