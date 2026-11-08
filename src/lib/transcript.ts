/** Turns a WebVTT transcript (what Zoom produces) into readable text: "[00:01:23] Speaker: words". */
export function vttToText(vtt: string) {
  if (!/^WEBVTT/.test(vtt.trim())) return vtt.trim();
  const out: string[] = [];
  let last = "";
  for (const block of vtt.replace(/\r/g, "").split(/\n\n+/)) {
    const lines = block.split("\n").filter(Boolean);
    const ti = lines.findIndex((l) => l.includes("-->"));
    if (ti < 0) continue;
    const time = lines[ti].split("-->")[0].trim().replace(/\.\d+$/, "");
    const text = lines.slice(ti + 1).join(" ").trim();
    if (!text || text === last) continue;
    last = text;
    out.push(`[${time}] ${text}`);
  }
  return out.join("\n");
}
