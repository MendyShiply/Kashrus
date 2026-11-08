import Link from "next/link";

export default function MembersOnly({ loggedIn }: { loggedIn: boolean }) {
  return (
    <div className="card center" style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2>Members only</h2>
      <p className="muted">
        The videos are shared with approved members of the community only.
        {loggedIn ? " Your request is still being reviewed." : " Request to join and you will be notified once you are approved."}
      </p>
      {loggedIn ? (
        <Link className="btn btn-outline" href="/pending">Check my status</Link>
      ) : (
        <div className="row" style={{ justifyContent: "center" }}>
          <Link className="btn btn-gold" href="/signup">Request to join</Link>
          <Link className="btn btn-outline" href="/login">Log in</Link>
        </div>
      )}
    </div>
  );
}
