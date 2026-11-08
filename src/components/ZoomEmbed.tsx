"use client";

import { useRef, useState } from "react";

// Zoom's Meeting SDK (component view). It brings its own React 18, so it is loaded as separate
// browser scripts and never mixes with the site's own React.
const SDK_VERSION = "6.10.0";
const SCRIPTS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
  `https://cdn.jsdelivr.net/npm/@zoom/meetingsdk@${SDK_VERSION}/dist/component-view.umd.min.js`,
];

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load Zoom. Check your internet connection."));
    document.head.appendChild(s);
  });
}

type ZoomClient = {
  init: (o: Record<string, unknown>) => Promise<unknown>;
  join: (o: Record<string, unknown>) => Promise<unknown>;
  leaveMeeting?: () => Promise<unknown>;
};

export default function ZoomEmbed({ joinUrl }: { joinUrl?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "joined" | "error">("idle");
  const [error, setError] = useState("");

  async function join() {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/zoom/signature", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not join");
      for (const src of SCRIPTS) await loadScript(src);
      const mod = (window as unknown as Record<string, { default?: { createClient: () => ZoomClient }; createClient?: () => ZoomClient }>)["@zoom/meetingsdk"];
      const createClient = mod?.createClient || mod?.default?.createClient;
      if (!createClient) throw new Error("Zoom did not load correctly");
      const client = createClient();
      const width = Math.min(root.current?.clientWidth || 800, 1000);
      await client.init({
        zoomAppRoot: root.current!,
        language: "en-US",
        patchJsMedia: true,
        leaveOnPageUnload: true,
        customize: { video: { isResizable: true, viewSizes: { default: { width, height: Math.round((width * 9) / 16) } } } },
      });
      await client.join({
        signature: data.signature,
        meetingNumber: data.meetingNumber,
        password: data.password,
        userName: data.userName,
        userEmail: data.userEmail,
      });
      setState("joined");
    } catch (e) {
      const msg = e instanceof Error ? e.message : (e as { reason?: string })?.reason || "Could not join the meeting";
      setError(msg);
      setState("error");
    }
  }

  return (
    <div className="stack">
      <div ref={root} className="zoom-root" />
      {state !== "joined" && (
        <div className="card spread">
          <div>
            <h3>Watch the shiur right here</h3>
            <p className="muted small" style={{ margin: 0 }}>
              Joins the Zoom shiur inside this page under your name. Allow your browser to use audio when asked.
            </p>
          </div>
          <div className="row">
            <button className="btn btn-gold" onClick={join} disabled={state === "loading"}>
              {state === "loading" ? "Connecting..." : "Join here"}
            </button>
            {joinUrl && <a className="btn btn-outline" href={joinUrl} target="_blank" rel="noreferrer">Open in Zoom app</a>}
          </div>
        </div>
      )}
      {error && <div className="alert alert-error">{error}. You can also use “Open in Zoom app”.</div>}
    </div>
  );
}
