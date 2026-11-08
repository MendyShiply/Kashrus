"use client";
import { useFormStatus } from "react-dom";
export default function ImportButton({ label = "Import to site", pendingLabel = "Importing, this can take a few minutes..." }: { label?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button className="btn btn-gold btn-sm" disabled={pending}>{pending ? pendingLabel : label}</button>;
}
