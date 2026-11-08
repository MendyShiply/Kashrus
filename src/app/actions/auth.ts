"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type FormState = { error?: string; ok?: string } | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().toLowerCase().email("Please enter a valid email"),
  phone: z.string().trim().max(40).optional(),
  city: z.string().trim().max(100).optional(),
  reason: z.string().trim().max(2000).optional(),
  referredBy: z.string().trim().max(200).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { password, ...data } = parsed.data;
  if (form.get("agree") !== "on") return { error: "Please agree to the community guidelines." };

  const exists = await db.user.findUnique({ where: { email: data.email } });
  if (exists) return { error: "An account with this email already exists. Please log in." };

  const user = await db.user.create({
    data: { ...data, password: await bcrypt.hash(password, 12) },
  });
  await createSession(user.id);
  redirect("/pending");
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Email or password is incorrect." };
  }
  await createSession(user.id);
  if (user.role === "ADMIN") redirect("/admin");
  if (user.status !== "APPROVED") redirect("/pending");
  const next = String(form.get("next") || "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
