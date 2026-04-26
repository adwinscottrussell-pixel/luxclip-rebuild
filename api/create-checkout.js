import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    console.log("API HIT");

    // ✅ Check key
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Stripe key missing"
      });
    }

    // ✅ Only POST allowed
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    // 🔥 Get user ID
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "Missing userId"
      });
    }

    // 💰 Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: "price: "price_1TQS60GsAAuu4fir9MlAOkBg",
          quantity: 1
        }
      ],

      // 🔥 Link Stripe → your user
      metadata: {
        user_id: userId
      },

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