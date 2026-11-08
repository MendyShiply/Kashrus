"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireMember } from "@/lib/auth";
import type { FormState } from "./auth";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email"),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Please write a message").max(5000),
});

export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.contactMessage.create({ data: parsed.data });
  return { ok: "Thank you. Your message was sent and we will be in touch." };
}

export async function setNewsletterOptIn(form: FormData) {
  const user = await requireMember();
  await db.user.update({ where: { id: user.id }, data: { newsletter: form.get("on") === "1" } });
  revalidatePath("/newsletter");
}
