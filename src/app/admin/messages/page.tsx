import { db } from "@/lib/db";
import { deleteMessage, toggleMessage } from "@/app/actions/admin";

export default async function MessagesAdmin() {
  const messages = await db.contactMessage.findMany({ orderBy: [{ handled: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="stack">
      <h1>Messages</h1>
      {messages.length === 0 && <p className="muted">No messages yet.</p>}
      {messages.map((m) => (
        <div key={m.id} className="card" style={{ opacity: m.handled ? 0.6 : 1 }}>
          <div className="spread">
            <div><strong>{m.name}</strong> · <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || ""))}`}>{m.email}</a></div>
            <span className="small muted">{m.createdAt.toLocaleString()}</span>
          </div>
          {m.subject && <h3 style={{ marginTop: 8 }}>{m.subject}</h3>}
          <p style={{ whiteSpace: "pre-wrap" }}>{m.message}</p>
          <div className="row">
            <form action={toggleMessage}><input type="hidden" name="id" value={m.id} /><button className="btn btn-outline btn-sm">{m.handled ? "Mark as new" : "Mark as handled"}</button></form>
            <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><button className="btn btn-outline btn-sm">Delete</button></form>
          </div>
        </div>
      ))}
    </div>
  );
}
