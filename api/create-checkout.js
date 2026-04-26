import Stripe from "stripe";

export default async function handler(req, res) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe key missing" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],

      // ✅ THIS FIXES YOUR PROBLEM
      customer_email: "test@luxclip.ai",

      line_items: [
        {
          price: "price_1TQS60GsAAuu4fir9MlAOkBg",
          quantity: 1,
        },
      ],

      success_url: `${req.headers.origin}/dashboard.html`,
      cancel_url: `${req.headers.origin}/dashboard.html`,
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("STRIPE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
}