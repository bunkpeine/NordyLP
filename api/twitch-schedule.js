export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${process.env.TWITCH_USER_ID}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`
        }
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({
        error: data.error || "Twitch API error",
        message: data.message || "Unknown error"
      });
    }
  } catch (err) {
    res.status(500).json({ error: "Request to Twitch failed", details: err.message });
  }
}
