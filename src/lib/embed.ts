// Turn a normal YouTube / Vimeo / Google Drive / Zoom recording link into an embeddable player URL.
export function toEmbedUrl(raw?: string | null): string | null {
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname.startsWith("/embed/")) return url.toString();
    const short = url.pathname.match(/^\/(shorts|live)\/([\w-]+)/);
    if (short) return `https://www.youtube-nocookie.com/embed/${short[2]}`;
    const v = url.searchParams.get("v");
    if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  }
  if (host === "vimeo.com") {
    const m = url.pathname.match(/^\/(\d+)(?:\/(\w+))?/);
    if (m) return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}` : ""}`;
  }
  if (host === "player.vimeo.com") return url.toString();
  if (host === "drive.google.com") {
    const m = url.pathname.match(/\/file\/d\/([\w-]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  }
  // Anything else that is already an https embed link is used as is.
  if (url.protocol === "https:") return url.toString();
  return null;
}

export function youTubeThumb(raw?: string | null): string | null {
  const e = toEmbedUrl(raw);
  const m = e?.match(/youtube(?:-nocookie)?\.com\/embed\/([\w-]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
}
