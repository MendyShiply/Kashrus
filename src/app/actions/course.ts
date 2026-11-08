"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { requireMember } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { TRACKS, stripeEnabled } from "@/lib/course";

export async function enroll(form: FormData) {
  const user = await requireMember();
  const s = await getSettings();
  if (s.courseOpen !== "true") redirect("/course");
  const track = TRACKS[String(form.get("track"))] ? String(form.get("track")) : "HOME";

  let enrollment = await db.enrollment.findFirst({ where: { userId: user.id } });
  if (enrollment && enrollment.status !== "PENDING_PAYMENT") redirect("/course/learn");

  const price = Math.round(parseFloat(s.coursePrice || "0") * 100);
  if (!enrollment) {
    enrollment = await db.enrollment.create({
      data: { userId: user.id, track, status: price > 0 ? "PENDING_PAYMENT" : "ACTIVE" },
    });
  } else {
    enrollment = await db.enrollment.update({ where: { id: enrollment.id }, data: { track } });
  }
  if (price <= 0) redirect("/course/learn");

  if (!stripeEnabled()) redirect("/course?pending=1");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const base = process.env.SITE_URL || "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: enrollment.id,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: price,
          product_data: { name: `${s.courseTitle || "Mashgiach Training Course"}: ${TRACKS[track].label}` },
        },
      },
    ],
    success_url: `${base}/course/learn?paid=1`,
    cancel_url: `${base}/course`,
  });
  await db.enrollment.update({ where: { id: enrollment.id }, data: { stripeSessionId: session.id } });
  redirect(session.url!);
}

/** Marks a lesson done; when every lesson is done the enrollment is completed and a certificate is issued. */
export async function completeLesson(form: FormData) {
  const user = await requireMember();
  const lessonId = String(form.get("lessonId"));
  const enrollment = await db.enrollment.findFirst({ where: { userId: user.id, status: { in: ["ACTIVE", "COMPLETED"] } } });
  if (!enrollment) redirect("/course");

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: {},
    create: { userId: user.id, lessonId },
  });

  const [total, done] = await Promise.all([
    db.lesson.count(),
    db.lessonProgress.count({ where: { userId: user.id } }),
  ]);
  if (enrollment.status === "ACTIVE" && total > 0 && done >= total) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "COMPLETED", completedAt: new Date(), certificateCode: crypto.randomBytes(5).toString("hex").toUpperCase() },
    });
  }
  revalidatePath("/course/learn");
  const next = await db.lesson.findFirst({
    where: { progress: { none: { userId: user.id } } },
    orderBy: { order: "asc" },
  });
  redirect(next ? `/course/learn/${next.id}` : "/course/learn");
}

/** Adds a member to the course waiting list (before enrollment opens). */
export async function joinWaitingList(form: FormData) {
  const user = await requireMember();
  const track = TRACKS[String(form.get("track"))] ? String(form.get("track")) : "HOME";
  await db.courseInterest.upsert({ where: { userId: user.id }, update: { track }, create: { userId: user.id, track } });
  revalidatePath("/course");
  redirect("/course?waiting=1");
}
