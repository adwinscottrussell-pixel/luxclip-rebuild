import Stripe from "stripe";

export default async function handler(req, res) {
  try {
    console.log("API HIT");

    // ✅ Check key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Stripe key missing"
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // ✅ Only POST allowed
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    // ✅ Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1TQS60GsAAuu4fir9MlAOkBg", // YOUR PRICE ID
          quantity: 1
        }
      ],
      success_url: `${req.headers.origin}/dashboard.html`,
      cancel_url: `${req.headers.origin}/dashboard.html`
    });

    return res.status(200).json({
      url: session.url
    });

  } catch (err) {
    console.error("STRIPE ERROR:", err);

    return res.status(500).json({
      error: err.message
    });
  }
}