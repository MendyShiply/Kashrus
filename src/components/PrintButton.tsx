"use client";
export default function PrintButton() {
  return <button className="btn btn-navy btn-sm" onClick={() => window.print()}>Print or save as PDF</button>;
}
