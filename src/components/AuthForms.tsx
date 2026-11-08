"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, signup } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  return (
    <form action={action}>
      {state?.error && <div className="alert alert-error">{state.error}</div>}
      <div className="field"><label htmlFor="name">Full name</label><input id="name" name="name" type="text" required autoComplete="name" /></div>
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="field"><label htmlFor="phone">Phone (optional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
      <div className="field"><label htmlFor="city">City and community</label><input id="city" name="city" type="text" placeholder="e.g. Lakewood, NJ" /></div>
      <div className="field">
        <label htmlFor="reason">Why would you like to join? Who referred you?</label>
        <textarea id="reason" name="reason" placeholder="A few words help us review your request" />
      </div>
      <div className="field"><label htmlFor="password">Choose a password</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
      <div className="field">
        <label className="checkbox"><input type="checkbox" name="agree" required /> I agree to keep the content private and to speak respectfully.</label>
      </div>
      <button className="btn btn-gold" style={{ width: "100%" }} disabled={pending}>{pending ? "Sending..." : "Request to join"}</button>
      <p className="small muted center" style={{ marginTop: 14 }}>Already have an account? <Link href="/login">Log in</Link></p>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action}>
      {state?.error && <div className="alert alert-error">{state.error}</div>}
      <input type="hidden" name="next" value={next || ""} />
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
      <button className="btn btn-navy" style={{ width: "100%" }} disabled={pending}>{pending ? "Logging in..." : "Log in"}</button>
      <p className="small muted center" style={{ marginTop: 14 }}>New here? <Link href="/signup">Request to join</Link></p>
    </form>
  );
}
