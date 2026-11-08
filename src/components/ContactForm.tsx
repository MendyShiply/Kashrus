"use client";

import { useActionState } from "react";
import { sendContact } from "@/app/actions/public";

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, undefined);
  if (state?.ok) return <div className="alert alert-ok">{state.ok}</div>;
  return (
    <form action={action}>
      {state?.error && <div className="alert alert-error">{state.error}</div>}
      <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" type="text" required /></div>
      <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
      <div className="field"><label htmlFor="subject">Subject</label><input id="subject" name="subject" type="text" /></div>
      <div className="field"><label htmlFor="message">Message</label><textarea id="message" name="message" required /></div>
      <button className="btn btn-gold" disabled={pending}>{pending ? "Sending..." : "Send message"}</button>
    </form>
  );
}
