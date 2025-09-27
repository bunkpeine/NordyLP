export default async function handler(req, res) {
  res.status(200).json({
    clientId: process.env.TWITCH_CLIENT_ID || "❌ fehlt",
    clientSecret: process.env.TWITCH_CLIENT_SECRET ? "✅ gesetzt" : "❌ fehlt",
    userId: process.env.TWITCH_USER_ID || "❌ fehlt"
  });
}
