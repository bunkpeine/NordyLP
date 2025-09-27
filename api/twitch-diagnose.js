// api/twitch-diagnose.js
export default async function handler(req, res) {
  // ---- Eingaben / ENV ----
  const {
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_USER_ID,
    TWITCH_LOGIN,
  } = process.env;

  // login kann per Query überschrieben werden: /api/twitch-diagnose?login=nordylp
  const login = (req.query?.login || TWITCH_LOGIN || "nordylp").toString();

  const report = {
    input: {
      login,
      env: {
        clientId: TWITCH_CLIENT_ID ? mask(TWITCH_CLIENT_ID) : "missing",
        clientSecret: TWITCH_CLIENT_SECRET ? "set" : "missing",
        userId: TWITCH_USER_ID || "missing",
      },
    },
    token: {},
    user: {},
    schedule: {},
    hints: [],
  };

  try {
    // ---- A) Access Token holen (client_credentials) ----
    const tokenResp = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID || "",
        client_secret: TWITCH_CLIENT_SECRET || "",
        grant_type: "client_credentials",
      }),
    });

    const tokenJson = await tokenResp.json().catch(() => ({}));
    report.token.status = tokenResp.status;
    report.token.ok = tokenResp.ok;
    report.token.body = tokenResp.ok
      ? { tokenType: tokenJson.token_type, expiresIn: tokenJson.expires_in }
      : tokenJson;

    if (!tokenResp.ok) {
      pushHint(report, "Token", tokenJson?.message || "Token konnte nicht geholt werden.");
      return res.status(200).json(report);
    }

    const accessToken = tokenJson.access_token;

    // ---- B) User-ID ermitteln (falls nicht per ENV gesetzt) ----
    let broadcasterId = TWITCH_USER_ID;
    if (!broadcasterId) {
      const userResp = await fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID || "",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userJson = await userResp.json().catch(() => ({}));
      report.user.status = userResp.status;
      report.user.ok = userResp.ok;
      report.user.body = userResp.ok
        ? {
            id: userJson?.data?.[0]?.id || null,
            login: userJson?.data?.[0]?.login || null,
            display_name: userJson?.data?.[0]?.display_name || null,
          }
        : userJson;

      if (!userResp.ok || !userJson?.data?.[0]?.id) {
        pushHint(report, "User", "Konnte die User-ID nicht ermitteln. Prüfe Login-Name oder Token.");
        return res.status(200).json(report);
      }
      broadcasterId = userJson.data[0].id;
    } else {
      report.user.body = { id: broadcasterId, source: "env:TWITCH_USER_ID" };
      report.user.ok = true;
      report.user.status = 200;
    }

    // ---- C) Schedule abrufen ----
    const schedResp = await fetch(
      `https://api.twitch.tv/helix/schedule?broadcaster_id=${encodeURIComponent(broadcasterId)}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID || "",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const schedJson = await schedResp.json().catch(() => ({}));
    report.schedule.status = schedResp.status;
    report.schedule.ok = schedResp.ok;
    report.schedule.body = schedResp.ok
      ? {
          segmentsCount: Array.isArray(schedJson?.data?.segments) ? schedJson.data.segments.length : 0,
          sample: schedJson?.data?.segments?.[0] || null,
          pagination: schedJson?.pagination || null,
        }
      : schedJson;

    // ---- Hinweise generieren ----
    if (!schedResp.ok) {
      pushHint(report, "Schedule", schedJson?.message || "Schedule-Request fehlgeschlagen.");
    } else if (!schedJson?.data?.segments?.length) {
      pushHint(report, "Schedule", "Kein Streamplan eingetragen (segments ist leer). Lege Termine im Twitch Dashboard an.");
    }

    return res.status(200).json(report);
  } catch (err) {
    report.error = err?.message || String(err);
    pushHint(report, "Server", "Unerwarteter Fehler im Endpoint.");
    return res.status(200).json(report);
  }

  // --- helpers ---
  function mask(s) {
    if (!s) return "";
    return s.slice(0, 6) + "..." + s.slice(-4);
  }
  function pushHint(rep, area, message) {
    rep.hints.push({ area, message });
  }
}
