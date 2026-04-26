import Stripe from "stripe";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
    req.on("error", err => {
      reject(err);
    });
  });
}

export default async function handler(req, res) {
  try {
    console.log("API HIT");

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // 🔥 Parse body manually
    const rawBody = await getRawBody(req);
    const body = JSON.parse(rawBody);

    const userId = body.userId;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe key missing" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",

      line_items: [
        {
          price: "price_1TQS60GsAAuu4fir9MlAOkBg",
          quantity: 1,
        },
      ],

      metadata: {
        user_id: userId,
      },

      success_url: `${req.headers.origin}/dashboard.html`,
      cancel_url: `${req.headers.origin}/dashboard.html`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("STRIPE ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}