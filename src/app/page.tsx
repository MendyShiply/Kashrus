import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser, isMember } from "@/lib/auth";
import { site } from "@/lib/site";
import { VideoCard } from "@/components/Video";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  const member = isMember(user);
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  const [latest, shorts] = member
    ? await Promise.all([
        db.video.findMany({ where: { published: true, kind: "LONG" }, include: { category: true }, orderBy: { createdAt: "desc" }, take: 6 }),
        db.video.findMany({ where: { published: true, kind: "SHORT" }, include: { category: true }, orderBy: { createdAt: "desc" }, take: 4 }),
      ])
    : [[], []];

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">A private kashrus community</span>
          <div className="he-title">{site.hebrewName}</div>
          <h1>Raising the standard of kashrus, together.</h1>
          <p className="lead">
            Clear, practical shiurim and videos from {site.founder.name} for people who care about kashrus and want to
            understand it better: in the home, at the store, and wherever we eat.
          </p>
          <div className="row" style={{ marginTop: 24 }}>
            {member ? (
              <>
                <Link className="btn btn-gold" href="/videos">Watch the videos</Link>
                <Link className="btn btn-light" href="/live">Live shiurim</Link>
              </>
            ) : (
              <>
                <Link className="btn btn-gold" href="/signup">Request to join</Link>
                <Link className="btn btn-light" href="/about">Learn more</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {member && latest.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="spread"><h2>Latest videos</h2><Link href="/videos">See all</Link></div>
            <div className="grid grid-3">{latest.map((v) => <VideoCard key={v.id} v={v} />)}</div>
          </div>
        </section>
      )}
      {member && shorts.length > 0 && (
        <section className="section-tight">
          <div className="container">
            <div className="spread"><h2>Shorts</h2><Link href="/shorts">See all</Link></div>
            <div className="grid grid-4">{shorts.map((v) => <VideoCard key={v.id} v={v} />)}</div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="grid grid-fit">
            <div className="card">
              <span className="eyebrow">Our goal</span>
              <h3>A higher standard in America</h3>
              <p className="muted">{site.vision}</p>
            </div>
            <div className="card">
              <span className="eyebrow">Close knit</span>
              <h3>A community by choice</h3>
              <p className="muted">Joining is by request. Every member is approved personally, so the community stays focused and respectful.</p>
            </div>
            <div className="card">
              <span className="eyebrow">Independent</span>
              <h3>No agency, no agenda</h3>
              <p className="muted">{site.disclaimer} The only goal is better kashrus.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#f3efe4" }}>
        <div className="container">
          <span className="eyebrow">Topics</span>
          <h2>What we are learning</h2>
          <div className="grid grid-2" style={{ marginTop: 20 }}>
            {categories.map((c, i) => (
              <Link key={c.id} href={`/categories/${c.slug}`} className="card row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                <div className="cat-num">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{c.title}</h3>
                  <p className="muted small" style={{ margin: 0 }}>{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow center">
          <span className="eyebrow">Coming soon</span>
          <h2>Mashgiach training course</h2>
          <p className="muted">
            A structured course, with rabbinic approval, to train you to be a mashgiach for restaurants and food
            establishments, or simply for your own home. Graduates receive a signed certificate.
          </p>
          <Link className="btn btn-navy" href="/course">About the course</Link>
        </div>
      </section>
    </>
  );
}
