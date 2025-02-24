addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // API endpoint: /api/download?url=<Pinterest URL>
  if (path.startsWith("/api/download")) {
    const pinUrl = url.searchParams.get("url");
    if (!isValidPinterestUrl(pinUrl)) {
      return jsonResponse({ error: "Invalid Pinterest URL" }, 400);
    }

    try {
      const response = await fetch(pinUrl, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9"
        }
      });
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const html = await response.text();
      const mediaUrl = extractMediaUrl(html);
      
      if (!mediaUrl) return jsonResponse({ error: "Media not found" }, 404);
      
      return jsonResponse({ mediaUrl });

    } catch (error) {
      return jsonResponse({ error: "Failed to process request" }, 500);
    }
  }

  // Media proxy endpoint
  if (path.startsWith("/api/downloadMedia")) {
    const mediaUrl = url.searchParams.get("url");
    if (!isValidMediaUrl(mediaUrl)) {
      return jsonResponse({ error: "Invalid media URL" }, 400);
    }

    try {
      const mediaResponse = await fetch(mediaUrl);
      const headers = new Headers(mediaResponse.headers);
      headers.set("Content-Disposition", `attachment; filename="${mediaUrl.split('/').pop()}"`);
      return new Response(mediaResponse.body, { headers });
    } catch (error) {
      return jsonResponse({ error: "Failed to download media" }, 500);
    }
  }

  // Serve main UI
  return new Response(generateHTML(), {
    headers: { "Content-Type": "text/html" }
  });
}

function isValidPinterestUrl(url) {
  return url && /^(https?:\/\/)?(www\.)?(pinterest\.com|pin\.it|in\.pinterest\.com)\/.*/.test(url);
}

function isValidMediaUrl(url) {
  return /^https?:\/\/.*\.(pinimg\.com|pinterest\.com)\/.*/.test(url);
}

function extractMediaUrl(html) {
  // Try JSON-LD parsing first
  const jsonLdScripts = html.split('<script type="application/ld+json">');
  for (let i = 1; i < jsonLdScripts.length; i++) {
    try {
      const json = JSON.parse(jsonLdScripts[i].split('</script>')[0].trim());
      if (json.contentUrl) return json.contentUrl.replace(/\\/g, '');
    } catch (e) {}
  }

  // Fallback to meta tag scraping
  const videoMatch = html.match(/<meta property="og:video" content="(.*?)"/);
  if (videoMatch) return videoMatch[1];

  const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);
  return imageMatch ? imageMatch[1] : null;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function generateHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pinterest Media Downloader - New World Best Edit</title>
      <style>
        :root {
          --primary: #ff6f61;
          --background: linear-gradient(135deg, #1a1a2e, #16213e);
          --glass: rgba(255, 255, 255, 0.05);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', sans-serif;
          background: var(--background);
          color: white;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .container {
          background: var(--glass);
          backdrop-filter: blur(12px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-width: 600px;
          text-align: center;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, var(--primary), #ff8a5b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .input-group {
          margin: 2rem 0;
        }

        input {
          width: 100%;
          padding: 15px 25px;
          border: none;
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 0 3px var(--primary);
        }

        button {
          background: var(--primary);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.3s ease;
          margin-top: 1rem;
        }

        button:hover {
          transform: translateY(-2px);
        }

        #result {
          margin-top: 2rem;
          min-height: 100px;
        }

        .media-preview {
          max-width: 100%;
          border-radius: 15px;
          margin: 1rem 0;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          background: var(--primary);
          color: white;
          padding: 12px 30px;
          border-radius: 50px;
          margin-top: 1rem;
          transition: transform 0.3s ease;
        }

        .download-btn:hover {
          transform: translateY(-2px);
        }

        .loading {
          display: inline-block;
          width: 30px;
          height: 30px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: var(--primary);
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error {
          color: #ff4444;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Pinterest Media Downloader</h1>
        <p>Download high-quality images and videos from Pinterest</p>
        
        <div class="input-group">
          <input 
            type="text" 
            id="pinUrl" 
            placeholder="Paste Pinterest URL here..."
            autocomplete="off"
          >
          <button onclick="downloadMedia()">Download Now</button>
        </div>

        <div id="result"></div>
      </div>

      <script>
        async function downloadMedia() {
          const url = document.getElementById('pinUrl').value.trim();
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = '<div class="loading"></div>';

          try {
            const response = await fetch(\`/api/download?url=\${encodeURIComponent(url)}\`);
            const data = await response.json();

            if (data.error) {
              showError(data.error);
              return;
            }

            resultDiv.innerHTML = \`
              <div class="preview-container">
                \${getMediaPreview(data.mediaUrl)}
                <a href="/api/downloadMedia?url=\${encodeURIComponent(data.mediaUrl)}" 
                   class="download-btn">
                  Download Now
                </a>
              </div>
            \`;
          } catch (error) {
            showError('Failed to process your request');
          }
        }

        function getMediaPreview(url) {
          if (url.includes('.mp4')) {
            return \`<video class="media-preview" controls src="\${url}"></video>\`;
          }
          return \`<img class="media-preview" src="\${url}" onerror="this.style.display='none'">\`;
        }

        function showError(message) {
          document.getElementById('result').innerHTML = \`
            <div class="error">⚠️ \${message}</div>
          \`;
        }

        // Handle Enter key
        document.getElementById('pinUrl').addEventListener('keypress', (e) => {
          if (e.key === 'Enter') downloadMedia();
        });
      </script>
    </body>
    </html>
  `;
}
