import fs from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { getCurrentUser } from "@/lib/auth";
import { resolveUpload, safeName, uploadRoot } from "@/lib/uploads";

// Admin only: streams a large file (e.g. a video) straight to disk without loading it into memory.
// The browser sends the raw file as the request body with the original name in the X-File-Name header.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return Response.json({ error: "Not allowed" }, { status: 403 });

  const original = decodeURIComponent(req.headers.get("x-file-name") || "");
  let name: string;
  try {
    name = safeName(original);
  } catch {
    return Response.json({ error: "That file type is not allowed. Use MP4, WebM, MOV, JPG, PNG or WebP." }, { status: 400 });
  }
  if (!req.body) return Response.json({ error: "Empty upload" }, { status: 400 });

  await fs.promises.mkdir(uploadRoot(), { recursive: true });
  const dest = resolveUpload(name);
  try {
    await pipeline(Readable.fromWeb(req.body as import("node:stream/web").ReadableStream), fs.createWriteStream(dest));
  } catch {
    await fs.promises.unlink(dest).catch(() => {});
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
  return Response.json({ name });
}
