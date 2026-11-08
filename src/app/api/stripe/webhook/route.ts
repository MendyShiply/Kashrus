import Stripe from "stripe";
import { db } from "@/lib/db";

// Stripe calls this after a successful payment; it activates the student's enrollment.
export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whsec) return new Response("Stripe not configured", { status: 400 });
  const stripe = new Stripe(key);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") || "", whsec);
  } catch {
    return new Response("Bad signature", { status: 400 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.client_reference_id && session.payment_status === "paid") {
      await db.enrollment.updateMany({
        where: { id: session.client_reference_id, status: "PENDING_PAYMENT" },
        data: { status: "ACTIVE" },
      });
    }
  }
  return Response.json({ received: true });
}
