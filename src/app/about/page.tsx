import Link from "next/link";
import { site } from "@/lib/site";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <section className="hero" style={{ padding: "64px 0" }}>
        <div className="container">
          <span className="eyebrow">About</span>
          <div className="he-title">{site.founder.hebrewName}</div>
          <h1>{site.founder.name}</h1>
        </div>
      </section>
      <section className="section">
        <div className="container narrow stack">
          {/* Edit this text to tell the Rav's story. */}
          <h2>About the Rav</h2>
          <p>
            {site.founder.name} has spent years in the field of kashrus, seeing first hand what happens behind the
            counter in bakeries, restaurants, supermarkets, catering kitchens and events. [Add the Rav's background
            here: where he learned, his experience as a mashgiach, and the communities he has served.]
          </p>
          <h2>Why {site.name}</h2>
          <p>
            Many people care deeply about kashrus but do not know what to look for, what questions to ask, or how
            reliable a given establishment really is. This community was created to share that knowledge in a clear,
            practical way with people who want it.
          </p>
          <p>
            Our long term vision: {site.vision.charAt(0).toLowerCase() + site.vision.slice(1)}
          </p>
          <div className="card">
            <h3>Independent</h3>
            <p className="muted" style={{ margin: 0 }}>
              {site.disclaimer} Nothing on this site is an endorsement or criticism of any specific hechsher; the goal
              is education.
            </p>
          </div>
          <h2>Joining</h2>
          <p>
            Membership is by choice and by approval. We keep the community small and serious so that it stays a place
            of learning. If that sounds like you, we would love to have you.
          </p>
          <div className="row">
            <Link className="btn btn-gold" href="/signup">Request to join</Link>
            <Link className="btn btn-outline" href="/contact">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
