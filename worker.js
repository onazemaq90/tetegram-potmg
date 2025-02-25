addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Telegram webhook endpoint
  if (path.startsWith("/telegram/webhook")) {
    if (request.method === "POST") {
      try {
        const telegramData = await request.json();
        return await handleTelegramRequest(telegramData);
      } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid Telegram data" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return new Response("Telegram Webhook Ready", { status: 200 });
  }

  // Existing Pinterest API endpoint
  if (path.startsWith("/api/download")) {
    const pinUrl = url.searchParams.get("url");
    if (!pinUrl || (!pinUrl.includes("pin.it") && !pinUrl.includes("in.pinterest.com"))) {
      return new Response(JSON.stringify({ error: "Invalid Pinterest URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const response = await fetch(pinUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const html = await response.text();
      const mediaMatch = html.match(/"contentUrl":\s*"([^"]+\.(jpg|png|mp4))"/);
      const mediaUrl = mediaMatch ? mediaMatch[1] : null;

      if (!mediaUrl) {
        return new Response(JSON.stringify({ error: "No media found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ mediaUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch media" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(generateHTML(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

// Handle Telegram bot requests
async function handleTelegramRequest(data) {
  const TELEGRAM_API_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4"; // Replace with your bot token
  const chatId = data.message?.chat?.id;
  const text = data.message?.text;

  if (!chatId || !text) {
    return new Response("OK", { status: 200 });
  }

  // Simple command handler
  if (text.startsWith("/start")) {
    await sendTelegramMessage(TELEGRAM_API_TOKEN, chatId, "Welcome to New World Pinterest Downloader! Send me a Pinterest URL to download media.");
  } else if (text.includes("pin.it") || text.includes("in.pinterest.com")) {
    try {
      const response = await fetch(`${self.location.origin}/api/download?url=${encodeURIComponent(text)}`);
      const result = await response.json();

      if (result.mediaUrl) {
        await sendTelegramMessage(TELEGRAM_API_TOKEN, chatId, `Here's your media: ${result.mediaUrl}`);
      } else {
        await sendTelegramMessage(TELEGRAM_API_TOKEN, chatId, "Couldn't find media in that URL.");
      }
    } catch (error) {
      await sendTelegramMessage(TELEGRAM_API_TOKEN, chatId, "Error processing your request.");
    }
  } else {
    await sendTelegramMessage(TELEGRAM_API_TOKEN, chatId, "Please send a valid Pinterest URL.");
  }

  return new Response("OK", { status: 200 });
}

// Send message via Telegram API
async function sendTelegramMessage(token, chatId, message) {
  const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });
}

// Updated HTML with Telegram instructions
function generateHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New World Best Edit - Pinterest Media Downloader</title>
      <style>
        body {
          margin: 0;
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          text-align: center;
          max-width: 600px;
        }
        h1 {
          font-size: 2.5em;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        input {
          width: 80%;
          padding: 15px;
          margin: 10px 0;
          border: none;
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.9);
          font-size: 1em;
          outline: none;
        }
        button {
          padding: 15px 30px;
          border: none;
          border-radius: 25px;
          background: #ff6f61;
          color: #fff;
          font-size: 1em;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        button:hover {
          background: #ff8a75;
        }
        #result {
          margin-top: 20px;
          font-size: 1.1em;
          word-wrap: break-word;
        }
        .telegram-info {
          margin-top: 20px;
          font-size: 0.9em;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New World Best Edit</h1>
        <p>Download Pinterest Media with Ease</p>
        <input type="text" id="pinUrl" placeholder="Enter Pinterest URL (e.g., https://pin.it/xxx)">
        <button onclick="downloadMedia()">Download</button>
        <div id="result"></div>
        <div class="telegram-info">
          <p>Or use our Telegram bot! Search for @NewWorldDownloaderBot</p>
        </div>
      </div>
      <script>
        async function downloadMedia() {
          const url = document.getElementById("pinUrl").value;
          const resultDiv = document.getElementById("result");
          resultDiv.innerHTML = "Fetching...";

          try {
            const response = await fetch(\`/api/download?url=\${encodeURIComponent(url)}\`);
            const data = await response.json();

            if (data.error) {
              resultDiv.innerHTML = \`Error: \${data.error}\`;
            } else {
              resultDiv.innerHTML = \`Media URL: <a href="\${data.mediaUrl}" target="_blank">\${data.mediaUrl}</a>\`;
            }
          } catch (error) {
            resultDiv.innerHTML = "Error: Unable to fetch media.";
          }
        }
      </script>
    </body>
    </html>
  `;
}
