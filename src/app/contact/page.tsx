import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container section">
      <div className="card form-card" style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: "1.9rem" }}>Contact us</h1>
        <p className="muted">
          Questions, a kashrus shaila you would like addressed in a video, or interest in the course? Send a message
          and we will get back to you.
          {site.contactEmail && <> You can also email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.</>}
        </p>
        <ContactForm />
      </div>
    </div>
  );
}
