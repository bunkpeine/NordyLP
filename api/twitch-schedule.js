export default async function handler(req, res) {
  res.json({
    clientId: process.env.TWITCH_CLIENT_ID || "missing",
    secret: process.env.TWITCH_CLIENT_SECRET ? "set" : "missing",
    userId: process.env.TWITCH_USER_ID || "missing",
    token: process.env.TWITCH_OAUTH_TOKEN ? "set" : "missing"
  });
}


export default async function handler(req, res) {
  try {
    // 1. Hole Access Token
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Anfrage an Twitch Schedule API
    const response = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${process.env.TWITCH_USER_ID}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json({
        error: data.error || "Twitch API error",
        message: data.message || "Unknown error",
      });
    }
    } catch (err) {
    res.status(500).json({
      error: "Request to Twitch failed",
      details: err.message,
      env: {
        clientId: process.env.TWITCH_CLIENT_ID ? "ok" : "missing",
        clientSecret: process.env.TWITCH_CLIENT_SECRET ? "ok" : "missing",
        userId: process.env.TWITCH_USER_ID || "missing",
      }
    });
  }

}
