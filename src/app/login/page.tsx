import { LoginForm } from "@/components/AuthForms";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="container section">
      <div className="card form-card">
        <h1 style={{ fontSize: "1.9rem" }}>Welcome back</h1>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
