"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { draftFromVideo, draftNewsletter } from "@/lib/drafts";

function fail(e: unknown): never {
  redirect(`/admin/articles?error=${encodeURIComponent(e instanceof Error ? e.message : "Drafting failed")}`);
}

export async function draftFromVideoAction(form: FormData) {
  await requireAdmin();
  const kind = form.get("kind") === "ARTICLE" ? "ARTICLE" : "WRITEUP";
  let id: string;
  try {
    id = (await draftFromVideo(String(form.get("videoId")), kind)).id;
  } catch (e) {
    fail(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/articles/${id}`);
}

export async function draftNewsletterAction(form: FormData) {
  await requireAdmin();
  const days = Math.min(Math.max(parseInt(String(form.get("days"))) || 30, 1), 120);
  let id: string;
  try {
    id = (await draftNewsletter(days)).id;
  } catch (e) {
    fail(e);
  }
  revalidatePath("/admin", "layout");
  redirect(`/admin/articles/${id}`);
}
