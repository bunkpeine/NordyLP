export default async function handler(req, res) {
  try {
    const safe = (val) =>
      val ? val.substring(0, 4) + "..." + val.slice(-4) : "MISSING";

    res.status(200).json({
      TWITCH_CLIENT_ID: safe(process.env.TWITCH_CLIENT_ID),
      TWITCH_CLIENT_SECRET: safe(process.env.TWITCH_CLIENT_SECRET),
      TWITCH_USER_ID: process.env.TWITCH_USER_ID || "MISSING",
    });
  } catch (err) {
    res.status(500).json({ error: "debug-env failed", details: err.message });
  }
}
