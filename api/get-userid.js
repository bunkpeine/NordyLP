export default async function handler(req, res) {
  try {
    // Schritt 1: Access-Token holen
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

    // Schritt 2: User-Info mit Login-Namen holen
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=nordylp`, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${accessToken}`
      }
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(userResponse.status).json({ error: "Twitch API error", details: userData });
    }

    // Schritt 3: ID zurückgeben
    res.status(200).json({
      login: "nordylp",
      userId: userData.data?.[0]?.id || "not found",
      raw: userData
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
