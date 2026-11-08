import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container spread">
        <div>
          <div className="brand-name" style={{ fontFamily: "var(--serif)", fontSize: "1.2rem" }}>
            {site.name} <span className="he">{site.hebrewName}</span>
          </div>
          <div>Under the guidance of {site.founder.name}</div>
          <div className="small" style={{ opacity: 0.8 }}>{site.disclaimer}</div>
          <div className="small" style={{ opacity: 0.8 }}>This community provides education. Please bring personal halachic questions to your rav.</div>
        </div>
        <div className="row">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/course">Course</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
