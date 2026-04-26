import Stripe from "stripe";
import { users } from "./store.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    const buf = await buffer(req);

    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("✅ EVENT TYPE:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const email = session.customer_email;

    console.log("👤 USER EMAIL:", email);

    if (email) {
      users[email] = { pro: true };

      console.log("🔥 USER UPGRADED TO PRO:", email);
    }
  }

  res.status(200).json({ received: true });
}