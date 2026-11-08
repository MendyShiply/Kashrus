"use client";
import { useFormStatus } from "react-dom";
export default function ImportButton() {
  const { pending } = useFormStatus();
  return <button className="btn btn-gold btn-sm" disabled={pending}>{pending ? "Importing, this can take a few minutes..." : "Import to site"}</button>;
}
