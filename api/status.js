import { users } from "./store.js";

export default function handler(req, res) {
  const { email } = req.query;

  const user = users[email];

  res.status(200).json({
    pro: user?.pro || false,
  });
}