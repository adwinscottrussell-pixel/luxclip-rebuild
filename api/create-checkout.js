import Stripe from "stripe";

export default async function handler(req, res) {
  try {
    console.log("API HIT");

    // ❌ Block wrong method
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    // ❌ Check key exists
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Stripe key missing"
      });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // ✅ Get email from frontend
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email required"
      });
    }

    console.log("CREATING SESSION FOR:", email);

    // ✅ CREATE CHECKOUT SESSION (FIXED)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      customer_email: email, // ✅ THIS IS CORRECT (NO customer_creation)

      line_items: [
        {
          price: "price_1TQS60GsAAuu4fir9MlAOkBg",
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