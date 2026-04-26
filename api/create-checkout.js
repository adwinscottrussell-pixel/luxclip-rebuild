import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    console.log("API HIT");

    // ✅ Only POST allowed
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // ✅ Parse body safely
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const userId = body?.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe key missing" });
    }

    // 💰 Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: "price_1TQS60GsAAuu4fir9MlAOkBg",
          quantity: 1
        }
      ],

      metadata: {
        user_id: userId
      },

      success_url: `${req.headers.origin}/dashboard.html`,
      cancel_url: `${req.headers.origin}/dashboard.html`
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("🔥 STRIPE ERROR:", err);

    return res.status(500).json({
      error: err.message || "Stripe failed"
    });
  }
}