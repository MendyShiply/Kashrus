import { db } from "@/lib/db";
import { deleteRabbi, saveRabbi } from "@/app/actions/admin";

type R = Awaited<ReturnType<typeof db.rabbi.findMany>>[number];

function Fields({ r, next }: { r?: R; next: number }) {
  return (
    <>
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="field"><label>Name</label><input name="name" type="text" required defaultValue={r?.name} placeholder="Rabbi ..." /></div>
        <div className="field"><label>Hebrew name</label><input name="hebrewName" type="text" dir="rtl" defaultValue={r?.hebrewName || ""} /></div>
        <div className="field"><label>Title / position</label><input name="title" type="text" defaultValue={r?.title || ""} placeholder="Rav of ..., Dayan ..." /></div>
        <div className="field"><label>Community / city</label><input name="community" type="text" defaultValue={r?.community || ""} /></div>
      </div>
      <div className="field"><label>Haskama text (shown on the course page)</label><textarea name="letter" defaultValue={r?.letter || ""} /></div>
      <div className="grid grid-2" style={{ gap: 12 }}>
        <div className="field">
          <label>Signature image</label>
          <input name="signature" type="file" accept="image/*" />
          {r?.signaturePath && <img src={`/media/${r.signaturePath}`} alt="" style={{ maxHeight: 50, marginTop: 6 }} />}
        </div>
        <div className="field"><label>Order</label><input name="order" type="number" defaultValue={r?.order ?? next} /></div>
      </div>
      <div className="field"><label className="checkbox"><input type="checkbox" name="onCertificate" defaultChecked={r?.onCertificate ?? true} /> Sign on graduates&apos; certificates</label></div>
    </>
  );
}

export default async function RabbisAdmin() {
  const rabbis = await db.rabbi.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="stack">
      <h1>Rabbis and haskamos</h1>
      <p className="muted">Rabbanim who approve the course. They are listed on the course page and, if chosen, sign the certificate next to the Rav.</p>
      {rabbis.map((r) => (
        <div key={r.id} className="card">
          <form action={saveRabbi}><Fields r={r} next={rabbis.length + 1} /><button className="btn btn-navy btn-sm">Save</button></form>
          <form action={deleteRabbi} style={{ marginTop: 8 }}>
            <input type="hidden" name="id" value={r.id} />
            <button className="linklike small" style={{ color: "var(--bad)" }}>Remove</button>
          </form>
        </div>
      ))}
      <form action={saveRabbi} className="card">
        <h3>Add a rabbi</h3>
        <Fields next={rabbis.length + 1} />
        <button className="btn btn-gold btn-sm">Add</button>
      </form>
    </div>
  );
}
