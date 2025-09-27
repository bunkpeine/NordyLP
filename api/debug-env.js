export default function handler(req, res) {
  res.json({
    clientId: process.env.TWITCH_CLIENT_ID
      ? process.env.TWITCH_CLIENT_ID.substring(0, 6) + "..."
      : "missing",

    secret: process.env.TWITCH_CLIENT_SECRET
      ? process.env.TWITCH_CLIENT_SECRET.substring(0, 6) + "..."
      : "missing",

    userId: process.env.TWITCH_USER_ID
      ? process.env.TWITCH_USER_ID
      : "missing",
  });
}
