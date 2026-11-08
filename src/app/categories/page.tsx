import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { videos: { where: { published: true } } } } },
  });
  return (
    <div className="container section">
      <span className="eyebrow">Topics</span>
      <h1>Categories</h1>
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        {categories.map((c, i) => (
          <Link key={c.id} href={`/categories/${c.slug}`} className="card">
            <div className="spread">
              <div className="cat-num">{String(i + 1).padStart(2, "0")}</div>
              {c.hebrew && <span className="he muted">{c.hebrew}</span>}
            </div>
            <h3 style={{ marginTop: 12 }}>{c.title}</h3>
            <p className="muted small">{c.description}</p>
            <span className="tag tag-navy">{c._count.videos} {c._count.videos === 1 ? "video" : "videos"}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
