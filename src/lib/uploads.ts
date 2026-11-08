import "server-only";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

export function uploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

const SAFE_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export function safeName(original: string) {
  const ext = path.extname(original).toLowerCase();
  if (!SAFE_EXT.has(ext)) throw new Error("File type not allowed");
  return `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
}

/** Resolve a stored file name to an absolute path, refusing anything outside the upload folder. */
export function resolveUpload(name: string) {
  const root = uploadRoot();
  const full = path.resolve(root, name);
  if (!full.startsWith(root + path.sep)) throw new Error("Bad path");
  return full;
}

export async function saveFile(file: File) {
  const name = safeName(file.name);
  await fs.mkdir(uploadRoot(), { recursive: true });
  await fs.writeFile(resolveUpload(name), Buffer.from(await file.arrayBuffer()));
  return name;
}

export async function removeFile(name?: string | null) {
  if (!name) return;
  try {
    await fs.unlink(resolveUpload(name));
  } catch {}
}

export const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};
