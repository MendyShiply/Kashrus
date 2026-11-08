"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { autoDraftForVideo } from "@/lib/drafts";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { removeFile, saveFile } from "@/lib/uploads";

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const opt = (f: FormData, k: string) => str(f, k) || null;

/* Members */
export async function setMemberStatus(form: FormData) {
  const admin = await requireAdmin();
  const id = str(form, "id");
  const status = str(form, "status");
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status) || id === admin.id) return;
  await db.user.update({ where: { id }, data: { status, reviewedAt: new Date() } });
  revalidatePath("/admin", "layout");
}

export async function setMemberRole(form: FormData) {
  const admin = await requireAdmin();
  const id = str(form, "id");
  const role = str(form, "role");
  if (!["ADMIN", "MEMBER"].includes(role) || id === admin.id) return;
  await db.user.update({ where: { id }, data: { role, ...(role === "ADMIN" ? { status: "APPROVED" } : {}) } });
  revalidatePath("/admin/members");
}

export async function deleteMember(form: FormData) {
  const admin = await requireAdmin();
  const id = str(form, "id");
  if (id === admin.id) return;
  await db.user.delete({ where: { id } });
  revalidatePath("/admin", "layout");
}

/* Videos */
export async function saveVideo(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const source = str(form, "source") === "UPLOAD" ? "UPLOAD" : "EMBED";
  const data = {
    title: str(form, "title") || "Untitled",
    description: opt(form, "description"),
    kind: str(form, "kind") === "SHORT" ? "SHORT" : "LONG",
    source,
    embedUrl: source === "EMBED" ? opt(form, "embedUrl") : null,
    filePath: source === "UPLOAD" ? opt(form, "filePath") : null,
    thumbnail: opt(form, "thumbnail"),
    summary: opt(form, "summary"),
    transcript: opt(form, "transcript"),
    categoryId: opt(form, "categoryId"),
    published: form.get("published") === "on",
  };
  let videoId = id;
  if (id) {
    const old = await db.video.findUnique({ where: { id } });
    if (old && old.filePath && old.filePath !== data.filePath) await removeFile(old.filePath);
    if (old && old.thumbnail && old.thumbnail !== data.thumbnail) await removeFile(old.thumbnail);
    await db.video.update({ where: { id }, data });
  } else {
    videoId = (await db.video.create({ data })).id;
  }
  // A transcript means a write up can be drafted for the Rav to approve. Runs after the page responds.
  if (data.transcript) after(() => autoDraftForVideo(videoId));
  revalidatePath("/", "layout");
  redirect("/admin/videos");
}

export async function deleteVideo(form: FormData) {
  await requireAdmin();
  const v = await db.video.delete({ where: { id: str(form, "id") } });
  await removeFile(v.filePath);
  await removeFile(v.thumbnail);
  revalidatePath("/", "layout");
  redirect("/admin/videos");
}

/* Categories */
export async function saveCategory(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const title = str(form, "title");
  if (!title) return;
  const slug =
    str(form, "slug") ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const data = { title, slug, hebrew: opt(form, "hebrew"), description: opt(form, "description"), order: parseInt(str(form, "order")) || 0 };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });
  revalidatePath("/", "layout");
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  await db.category.delete({ where: { id: str(form, "id") } });
  revalidatePath("/", "layout");
}

/* Settings (live + course) */
const SETTING_KEYS = ["liveTitle", "liveJoinUrl", "liveMeetingId", "livePasscode", "liveSchedule", "liveNextAt", "liveNextTopic", "liveNextMinutes", "courseSyllabus", "courseTitle", "coursePrice"];
export async function saveSettings(form: FormData) {
  await requireAdmin();
  for (const k of SETTING_KEYS) if (form.has(k)) await setSetting(k, str(form, k));
  for (const k of ["liveIsOn", "courseOpen"]) if (form.has(`${k}__present`)) await setSetting(k, form.get(k) === "on" ? "true" : "false");
  const sig = form.get("founderSignature");
  if (sig instanceof File && sig.size > 0) await setSetting("founderSignature", await saveFile(sig));
  revalidatePath("/", "layout");
}

/* Messages */
export async function toggleMessage(form: FormData) {
  await requireAdmin();
  const m = await db.contactMessage.findUnique({ where: { id: str(form, "id") } });
  if (m) await db.contactMessage.update({ where: { id: m.id }, data: { handled: !m.handled } });
  revalidatePath("/admin", "layout");
}
export async function deleteMessage(form: FormData) {
  await requireAdmin();
  await db.contactMessage.delete({ where: { id: str(form, "id") } });
  revalidatePath("/admin", "layout");
}

/* Rabbis (haskamos) */
export async function saveRabbi(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const data: Record<string, unknown> = {
    name: str(form, "name") || "Unnamed",
    hebrewName: opt(form, "hebrewName"),
    title: opt(form, "title"),
    community: opt(form, "community"),
    letter: opt(form, "letter"),
    onCertificate: form.get("onCertificate") === "on",
    order: parseInt(str(form, "order")) || 0,
  };
  const sig = form.get("signature");
  if (sig instanceof File && sig.size > 0) data.signaturePath = await saveFile(sig);
  if (id) {
    if (data.signaturePath) {
      const old = await db.rabbi.findUnique({ where: { id } });
      await removeFile(old?.signaturePath);
    }
    await db.rabbi.update({ where: { id }, data });
  } else {
    await db.rabbi.create({ data: data as { name: string } });
  }
  revalidatePath("/", "layout");
}
export async function deleteRabbi(form: FormData) {
  await requireAdmin();
  const r = await db.rabbi.delete({ where: { id: str(form, "id") } });
  await removeFile(r.signaturePath);
  revalidatePath("/", "layout");
}

/* Lessons */
export async function saveLesson(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const data = {
    title: str(form, "title") || "Untitled lesson",
    description: opt(form, "description"),
    order: parseInt(str(form, "order")) || 0,
    videoId: opt(form, "videoId"),
    embedUrl: opt(form, "embedUrl"),
  };
  if (id) await db.lesson.update({ where: { id }, data });
  else await db.lesson.create({ data });
  revalidatePath("/", "layout");
}
export async function deleteLesson(form: FormData) {
  await requireAdmin();
  await db.lesson.delete({ where: { id: str(form, "id") } });
  revalidatePath("/", "layout");
}

/* Enrollments */
export async function setEnrollmentStatus(form: FormData) {
  await requireAdmin();
  const status = str(form, "status");
  if (!["ACTIVE", "PENDING_PAYMENT"].includes(status)) return;
  await db.enrollment.update({ where: { id: str(form, "id") }, data: { status } });
  revalidatePath("/admin/course");
}

/* Articles, newsletters and write ups.
   Nothing is posted until someone allowed to approve (the Rav) approves it. */
// One action per button, so the choice never depends on which button the browser reports as the submitter.
export async function saveArticleDraft(form: FormData) {
  return saveArticle(form, "save");
}
export async function submitArticle(form: FormData) {
  return saveArticle(form, "submit");
}
export async function approveArticle(form: FormData) {
  return saveArticle(form, "approve");
}

async function saveArticle(form: FormData, intent: "save" | "submit" | "approve") {
  const user = await requireAdmin();
  const id = str(form, "id");
  const kind = ["ARTICLE", "NEWSLETTER", "WRITEUP"].includes(str(form, "kind")) ? str(form, "kind") : "ARTICLE";
  const old = id ? await db.article.findUnique({ where: { id } }) : null;

  let status = old?.status || "DRAFT";
  if (intent === "submit") status = "PENDING";
  if (intent === "approve" && user.canApprove) status = "APPROVED";
  // Someone other than an approver changing an approved piece sends it back for approval.
  if (intent === "save" && old?.status === "APPROVED" && !user.canApprove) status = "PENDING";

  const data = {
    title: str(form, "title") || "Untitled",
    kind,
    body: str(form, "body"),
    videoId: opt(form, "videoId"),
    status,
    published: status === "APPROVED",
    ...(status === "APPROVED" && old?.status !== "APPROVED" ? { approvedBy: user.name, approvedAt: new Date(), returnNotes: null } : {}),
    ...(status !== "APPROVED" ? { approvedBy: null, approvedAt: null } : {}),
  };
  if (id) await db.article.update({ where: { id }, data });
  else await db.article.create({ data });
  revalidatePath("/", "layout");
  redirect(`/admin/articles${status === "PENDING" ? "?s=PENDING" : status === "APPROVED" ? "?s=APPROVED" : ""}`);
}

export async function returnArticle(form: FormData) {
  const user = await requireAdmin();
  if (!user.canApprove) return;
  await db.article.update({
    where: { id: str(form, "id") },
    data: { status: "DRAFT", published: false, approvedBy: null, approvedAt: null, returnNotes: opt(form, "returnNotes") },
  });
  revalidatePath("/", "layout");
  redirect("/admin/articles?s=DRAFT");
}

export async function unpublishArticle(form: FormData) {
  const user = await requireAdmin();
  if (!user.canApprove) return;
  await db.article.update({ where: { id: str(form, "id") }, data: { status: "DRAFT", published: false, approvedBy: null, approvedAt: null } });
  revalidatePath("/", "layout");
  redirect("/admin/articles?s=DRAFT");
}

export async function deleteArticle(form: FormData) {
  await requireAdmin();
  await db.article.delete({ where: { id: str(form, "id") } });
  revalidatePath("/", "layout");
  redirect("/admin/articles");
}

export async function setApprover(form: FormData) {
  const admin = await requireAdmin();
  if (!admin.canApprove) return; // only an approver can name other approvers
  await db.user.update({ where: { id: str(form, "id") }, data: { canApprove: str(form, "value") === "1" } });
  revalidatePath("/admin/members");
}
