import { db } from "@/lib/db";
import { deleteCategory, saveCategory } from "@/app/actions/admin";

export default async function CategoriesAdmin() {
  const cats = await db.category.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { videos: true } } } });
  return (
    <div className="stack">
      <h1>Categories</h1>
      {cats.map((c) => (
        <div key={c.id} className="card">
          <form action={saveCategory}>
            <input type="hidden" name="id" value={c.id} />
            <div className="grid grid-3" style={{ gap: 12 }}>
              <div className="field"><label>Title</label><input name="title" type="text" defaultValue={c.title} /></div>
              <div className="field"><label>Hebrew</label><input name="hebrew" type="text" dir="rtl" defaultValue={c.hebrew || ""} /></div>
              <div className="field"><label>Order</label><input name="order" type="number" defaultValue={c.order} /></div>
            </div>
            <div className="field"><label>Description</label><textarea name="description" style={{ minHeight: 60 }} defaultValue={c.description || ""} /></div>
            <input type="hidden" name="slug" value={c.slug} />
            <div className="row"><button className="btn btn-navy btn-sm">Save</button><span className="small muted">{c._count.videos} videos</span></div>
          </form>
          <form action={deleteCategory} style={{ marginTop: 8 }}>
            <input type="hidden" name="id" value={c.id} />
            <button className="linklike small" style={{ color: "var(--bad)" }}>Delete category (videos stay, without a category)</button>
          </form>
        </div>
      ))}
      <div className="card">
        <h3>Add a category</h3>
        <form action={saveCategory}>
          <div className="grid grid-3" style={{ gap: 12 }}>
            <div className="field"><label>Title</label><input name="title" type="text" required /></div>
            <div className="field"><label>Hebrew</label><input name="hebrew" type="text" dir="rtl" /></div>
            <div className="field"><label>Order</label><input name="order" type="number" defaultValue={cats.length + 1} /></div>
          </div>
          <div className="field"><label>Description</label><textarea name="description" style={{ minHeight: 60 }} /></div>
          <button className="btn btn-gold btn-sm">Add category</button>
        </form>
      </div>
    </div>
  );
}
