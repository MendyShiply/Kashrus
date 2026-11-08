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
          <h2>About the Rav</h2>
          <p>
            {site.founder.name} has spent many years in the field of kashrus, seeing first hand what happens behind
            the counter in bakeries, restaurants, supermarkets, catering kitchens and events.
          </p>
          <p>
            For many years he served with the OK, and he has also worked for the OU and for JSOR, the kashrus agency
            serving the Syrian community in Brooklyn and the Jersey Shore.
          </p>
          <p>
            He supervised the first kosher restaurant at a ski resort in the United States, at the Canyons in Park
            City, Utah, and he served as Director of Kashrus of CHK, the Vaad Hakashrus of Crown Heights.
          </p>
          <p>
            While at the OK, he created the mesh cloth method of checking produce for insects. It has since been
            adopted and refined across the kashrus world and is now one of the most widely used checking methods.
          </p>
          <p>
            He is the son in law of the late Rabbi Dovid Steigman ז״ל, Senior Rabbinic Coordinator at the OK for
            decades, who passed away while on the job in Italy. That legacy of dedication to kashrus is part of what
            drives this community.
          </p>
          <h2>Why {site.name}</h2>
          <p>
            Many people care deeply about kashrus but do not know what to look for, what questions to ask, or how
            reliable a given establishment really is. This community was created to share that knowledge in a clear,
            practical way with people who want it.
          </p>
          <p>
            Our long term vision: {site.vision.charAt(0).toLowerCase() + site.vision.slice(1)} This is a goal we
            are working toward through education and training, not a claim of affiliation with the Badatz or of any
            certification authority.
          </p>
          <div className="card">
            <h3>Independent</h3>
            <p className="muted" style={{ margin: 0 }}>
              The Rav brings experience from major agencies, but this community is his own. {site.disclaimer} Nothing on this site is an endorsement or criticism of any specific hechsher; the goal
              is education. For a personal halachic question, please ask your own rav.
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
