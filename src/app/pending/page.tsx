import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isMember } from "@/lib/auth";

export const metadata = { title: "Membership status" };

export default async function PendingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (isMember(user)) {
    return (
      <div className="container section narrow center">
        <h1>You are a member</h1>
        <p>Welcome, {user.name}. Everything is open to you.</p>
        <Link className="btn btn-gold" href="/videos">Start watching</Link>
      </div>
    );
  }
  return (
    <div className="container section narrow center">
      {user.status === "REJECTED" ? (
        <>
          <h1>Request not approved</h1>
          <p className="muted">
            Thank you for your interest. Your request to join was not approved at this time.
            If you think this is a mistake you are welcome to <Link href="/contact">contact us</Link>.
          </p>
        </>
      ) : (
        <>
          <span className="tag">Pending review</span>
          <h1 style={{ marginTop: 12 }}>Thank you, {user.name}</h1>
          <p className="muted">
            Your request to join has been received and will be reviewed personally.
            Once it is approved, log in again and all videos, shorts and live shiurim will be open to you.
          </p>
          <Link className="btn btn-outline" href="/about">Learn more about us</Link>
        </>
      )}
    </div>
  );
}
