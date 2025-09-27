// api/twitch-schedule.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // 1. Access Token holen
    const tokenResponse = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(500).json({
        error: "Auth error",
        details: tokenData,
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Twitch Schedule API aufrufen
    const response = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${process.env.TWITCH_USER_ID}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Twitch API error",
        details: data,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}
