import Link from "next/link";
import { db } from "@/lib/db";

export default async function VideosAdmin() {
  const videos = await db.video.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="stack">
      <div className="spread"><h1>Videos and shorts</h1><Link className="btn btn-gold" href="/admin/videos/new">+ Post a video</Link></div>
      {videos.length === 0 ? (
        <p className="muted">Nothing posted yet. Start with the first topic: Bug Awareness.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Type</th><th>Category</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.id}>
                  <td><Link href={`/videos/${v.id}`}>{v.title}</Link><div className="small muted">{v.createdAt.toLocaleDateString()}</div></td>
                  <td>{v.kind === "SHORT" ? "Short" : "Long form"}</td>
                  <td>{v.category?.title || <span className="muted">none</span>}</td>
                  <td>{v.published ? <span className="tag tag-ok">published</span> : <span className="tag">draft</span>}</td>
                  <td><Link className="btn btn-outline btn-sm" href={`/admin/videos/${v.id}`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
