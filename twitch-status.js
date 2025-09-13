
export default async (req, res) => {
  const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
  const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
  const TWITCH_USER = process.env.TWITCH_USER;

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Twitch API keys not configured.' });
  }

  try {
    // Schritt 1: App Access Token von Twitch holen
    const tokenResponse = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, {
      method: 'POST'
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Schritt 2: Stream-Informationen abrufen
    const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER}`, {
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const streamData = await streamResponse.json();

    // Sende die Daten zurück an den Client
    return res.status(200).json(streamData);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch Twitch data.' });
  }
};