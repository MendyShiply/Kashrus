import { deleteMember, setMemberRole, setMemberStatus } from "@/app/actions/admin";

type U = { id: string; name: string; email: string; phone: string | null; city: string | null; reason: string | null; status: string; role: string; createdAt: Date };

function Btn({ id, field, value, label, cls, action }: { id: string; field: string; value: string; label: string; cls: string; action: (f: FormData) => Promise<void> }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name={field} value={value} />
      <button className={`btn btn-sm ${cls}`}>{label}</button>
    </form>
  );
}

export default function MemberTable({ users, full = false }: { users: U[]; full?: boolean }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Person</th><th>About them</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <strong>{u.name}</strong>
                <div className="small"><a href={`mailto:${u.email}`}>{u.email}</a></div>
                {u.phone && <div className="small muted">{u.phone}</div>}
                <div className="small muted">Joined {u.createdAt.toLocaleDateString()}</div>
              </td>
              <td className="small">
                {u.city && <div><strong>{u.city}</strong></div>}
                <div style={{ whiteSpace: "pre-wrap", maxWidth: 320 }}>{u.reason || <span className="muted">No note</span>}</div>
              </td>
              <td>
                <span className={`tag ${u.status === "APPROVED" ? "tag-ok" : u.status === "REJECTED" ? "tag-bad" : ""}`}>{u.status.toLowerCase()}</span>
                {u.role === "ADMIN" && <div><span className="tag tag-navy">admin</span></div>}
              </td>
              <td>
                <div className="row">
                  {u.status !== "APPROVED" && <Btn id={u.id} field="status" value="APPROVED" label="Accept" cls="btn-ok" action={setMemberStatus} />}
                  {u.status !== "REJECTED" && u.role !== "ADMIN" && <Btn id={u.id} field="status" value="REJECTED" label="Reject" cls="btn-danger" action={setMemberStatus} />}
                  {full && u.status === "APPROVED" && (
                    u.role === "ADMIN"
                      ? <Btn id={u.id} field="role" value="MEMBER" label="Remove admin" cls="btn-outline" action={setMemberRole} />
                      : <Btn id={u.id} field="role" value="ADMIN" label="Make admin" cls="btn-outline" action={setMemberRole} />
                  )}
                  {full && <Btn id={u.id} field="x" value="" label="Delete" cls="btn-outline" action={deleteMember} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
