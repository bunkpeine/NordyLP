// script.js

// Diese Funktion holt die Daten von der neuen Serverless Function
async function getTwitchStatus() {
  const twitchStatusDiv = document.getElementById("twitch-status");

  try {
    const response = await fetch('/api/twitch-status'); // Ruft die neue API-Funktion auf
    const streamData = await response.json();

    if (streamData.data && streamData.data.length > 0) {
      // Streamer ist ONLINE
      const stream = streamData.data[0];
      const startTime = new Date(stream.started_at);
      const now = new Date();
      const uptimeMs = now - startTime;
      const hours = Math.floor(uptimeMs / 3600000);
      const minutes = Math.floor((uptimeMs % 3600000) / 60000);

      twitchStatusDiv.innerHTML = `
        <p><span class="live">🔴 LIVE</span></p>
        <p class="title" title="${stream.title}">${stream.title}</p>
        <p><b>Spiel:</b> ${stream.game_name}</p>
        <p><b>Live seit:</b> ${hours} Std. und ${minutes} Min.</p>
      `;
    } else {
      // Streamer ist OFFLINE
      twitchStatusDiv.innerHTML = "<p>NordyLP ist zurzeit <b>offline</b>.</p>";
    }
  } catch (error) {
    twitchStatusDiv.innerHTML = "<p>Fehler beim Abrufen der Stream-Daten.</p>";
    console.error("Fetch Error:", error);
  }
}

// Swiper und Twitch-Status aufrufen, nachdem das DOM geladen wurde
document.addEventListener("DOMContentLoaded", function() {
    // Swiper initialisieren
    var swiper = new Swiper('.swiper', {
      loop: false,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
    
    // Twitch Live-Status abrufen
    getTwitchStatus();
});