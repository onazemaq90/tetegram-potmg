addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // API endpoint: /api/download?url=<pin.it or in.pinterest.com URL>
  if (path.startsWith("/api/download")) {
    const pinUrl = url.searchParams.get("url");
    if (!pinUrl || (!pinUrl.includes("pin.it") && !pinUrl.includes("in.pinterest.com"))) {
      return new Response(JSON.stringify({ error: "Invalid Pinterest URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      // Fetch the Pinterest URL
      const response = await fetch(pinUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }, // Basic UA to avoid blocking
      });
      const html = await response.text();

      // Extract media URL (simplified scraping; use Pinterest API for production)
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

  // Serve the "New World Best Edit" web page
  return new Response(generateHTML(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

// Generate sleek, modern HTML page
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
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New World Best Edit</h1>
        <p>Download Pinterest Media with Ease</p>
        <input type="text" id="pinUrl" placeholder="Enter Pinterest URL (e.g., https://pin.it/xxx or https://in.pinterest.com/xxx)">
        <button onclick="downloadMedia()">Download</button>
        <div id="result"></div>
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
