export default async function handler(req, res) {
  try {
    // 1. Hole Access Token von Twitch
    const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      return res.status(500).json({ error: "Token fetch failed", details: tokenData });
    }

    const accessToken = tokenData.access_token;

    // 2. Anfrage an Twitch Schedule API
    const response = await fetch(`https://api.twitch.tv/helix/schedule?broadcaster_id=${process.env.TWITCH_USER_ID}`, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({ error: "Twitch API error", message: data });
    }
  } catch (err) {
    res.status(500).json({ error: "Request failed", details: err.message });
  }
}
