// api/twitch-schedule.js
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    // 1. Access Token holen
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return res.status(500).json({ error: "Auth error", details: errText });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Twitch Schedule API aufrufen
    const response = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${process.env.TWITCH_USER_ID}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: "Twitch API error",
        details: errText,
      });
    }

    const data = await response.json();

    // 3. Ergebnis zurückgeben
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({
      error: "Request to Twitch failed",
      details: err.message,
    });
  }
};
