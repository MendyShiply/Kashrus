"use server";

import fs from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { autoDraftForVideo } from "@/lib/drafts";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { resolveUpload, safeName, uploadRoot } from "@/lib/uploads";
import { vttToText } from "@/lib/transcript";
import { downloadZoomFile, encodeUuid, getMeetingSummary, zoomGet, type ZoomMeeting } from "@/lib/zoom";

const VIDEO_PREFERENCE = ["shared_screen_with_speaker_view", "active_speaker", "shared_screen_with_gallery_view", "speaker_view", "gallery_view", "shared_screen"];

/** Copies one Zoom cloud recording onto the site as a draft video, with its transcript and AI summary. */
export async function importZoomRecording(form: FormData) {
  await requireAdmin();
  const uuid = String(form.get("uuid"));
  const existing = await db.video.findUnique({ where: { zoomMeetingUuid: uuid } });
  if (existing) redirect(`/admin/videos/${existing.id}`);

  const meeting = await zoomGet<ZoomMeeting>(`/meetings/${encodeUuid(uuid)}/recordings`);
  const files = (meeting.recording_files || []).filter((f) => f.status === "completed");
  const mp4 = files
    .filter((f) => f.file_type === "MP4")
    .sort((a, b) => {
      const ia = VIDEO_PREFERENCE.indexOf(a.recording_type), ib = VIDEO_PREFERENCE.indexOf(b.recording_type);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })[0];
  if (!mp4) redirect("/admin/zoom?error=No+finished+video+file+found+for+that+recording+yet");

  await fs.promises.mkdir(uploadRoot(), { recursive: true });
  const name = safeName("zoom.mp4");
  const res = await downloadZoomFile(mp4.download_url);
  await pipeline(Readable.fromWeb(res.body as import("node:stream/web").ReadableStream), fs.createWriteStream(resolveUpload(name)));

  let transcript: string | null = null;
  const vtt = files.find((f) => f.file_type === "TRANSCRIPT");
  if (vtt) {
    try {
      transcript = vttToText(await (await downloadZoomFile(vtt.download_url)).text());
    } catch {}
  }
  const summary = await getMeetingSummary(uuid);
  const date = new Date(meeting.start_time).toLocaleDateString("en-US", { dateStyle: "long" });

  const video = await db.video.create({
    data: {
      title: meeting.topic || `Live shiur, ${date}`,
      description: `Recorded live on ${date}.`,
      kind: "LONG",
      source: "UPLOAD",
      filePath: name,
      transcript,
      summary,
      zoomMeetingUuid: uuid,
      published: false,
    },
  });
  if (transcript) after(() => autoDraftForVideo(video.id));
  revalidatePath("/admin", "layout");
  redirect(`/admin/videos/${video.id}?imported=1`);
}
