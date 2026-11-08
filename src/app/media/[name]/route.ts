import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { getCurrentUser, isMember } from "@/lib/auth";
import { MIME, resolveUpload } from "@/lib/uploads";

// Serves uploaded files. Videos are for approved members only and support seeking (Range requests).
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  let full: string;
  try {
    full = resolveUpload(name);
  } catch {
    return new Response("Not found", { status: 404 });
  }
  const ext = path.extname(full).toLowerCase();
  const type = MIME[ext];
  if (!type) return new Response("Not found", { status: 404 });

  const isVideo = type.startsWith("video/");
  if (isVideo && !isMember(await getCurrentUser())) {
    return new Response("Members only", { status: 403 });
  }

  let size: number;
  try {
    size = (await fs.promises.stat(full)).size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const headers: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    "Cache-Control": isVideo ? "private, max-age=3600" : "public, max-age=86400",
  };

  const range = req.headers.get("range");
  const m = range?.match(/bytes=(\d*)-(\d*)/);
  if (m && (m[1] || m[2])) {
    let start = m[1] ? parseInt(m[1], 10) : size - parseInt(m[2], 10);
    let end = m[1] && m[2] ? parseInt(m[2], 10) : size - 1;
    start = Math.max(0, start);
    end = Math.min(end, size - 1);
    if (start > end) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    const stream = fs.createReadStream(full, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1) },
    });
  }

  const stream = fs.createReadStream(full);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: { ...headers, "Content-Length": String(size) },
  });
}
