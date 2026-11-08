import Link from "next/link";
import { getCurrentUser, isMember } from "@/lib/auth";
import { site } from "@/lib/site";
import { logout } from "@/app/actions/auth";

export default async function Header() {
  const user = await getCurrentUser();
  const member = isMember(user);
  return (
    <header className="site-header">
      <div className="container bar">
        <Link href="/" className="brand">
          <span className="brand-name">{site.name}</span>
          <span className="brand-he">{site.hebrewName}</span>
        </Link>
        <input type="checkbox" id="menu" className="menu-toggle" aria-label="Open menu" />
        <label htmlFor="menu" className="menu-btn" aria-hidden>☰</label>
        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/videos">Videos</Link>
          <Link href="/shorts">Shorts</Link>
          <Link href="/live">Live</Link>
          <Link href="/articles">Articles</Link>
          <Link href="/course">Course</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          {user?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
          {user ? (
            <>
              {!member && <Link href="/pending">Status</Link>}
              <form action={logout}>
                <button className="linklike" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="btn btn-gold btn-sm">Request to join</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
