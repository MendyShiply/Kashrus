import { redirect } from "next/navigation";
import { SignupForm } from "@/components/AuthForms";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";

export const metadata = { title: "Request to join" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/pending");
  return (
    <div className="container section">
      <div className="card form-card">
        <h1 style={{ fontSize: "1.9rem" }}>Request to join</h1>
        <p className="muted">
          {site.name} is a private, invitation style community. Every request is reviewed personally.
          You will be able to watch the videos once your request is approved.
        </p>
        <SignupForm />
      </div>
    </div>
  );
}
