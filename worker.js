addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // API endpoint
  if (path.startsWith("/api/download")) {
    return handleAPIRequest(request);
  }

  // Serve enhanced web page
  return new Response(generateHTML(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const pinUrl = url.searchParams.get("url");

  // Validate URL
  if (!pinUrl || !isValidPinterestURL(pinUrl)) {
    return jsonResponse({ error: "Invalid Pinterest URL" }, 400);
  }

  try {
    const mediaUrl = await fetchMediaUrl(pinUrl);
    return jsonResponse({ mediaUrl });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

function isValidPinterestURL(url) {
  const patterns = [
    /^https?:\/\/(www\.)?pinterest\.(com|it)\/pin\//,
    /^https?:\/\/pin\.it\/\w+/,
    /^https?:\/\/(www\.)?in\.pinterest\.com\/pin\//
  ];
  return patterns.some(pattern => pattern.test(url));
}

async function fetchMediaUrl(pinUrl) {
  const response = await fetch(pinUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });
  
  if (!response.ok) throw new Error("Failed to fetch Pinterest page");
  
  const html = await response.text();
  const jsonData = html.match(/<script data-test-id="video-snippet".*?>(.*?)<\/script>/s);
  
  if (jsonData) {
    try {
      const data = JSON.parse(jsonData[1]);
      return data.contentUrl || data.thumbnailUrl;
    } catch (e) {
      throw new Error("Failed to parse media data");
    }
  }
  
  throw new Error("Media not found in page");
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

// Enhanced HTML generator with modern design
function generateHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>🔥 NWBE - Pinterest Media Downloader</title>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
      <style>
        :root {
          --neon-green: #0f0;
          --dark-bg: #0a0a0a;
          --glow: 0 0 15px var(--neon-green);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          background: var(--dark-bg);
          font-family: 'Montserrat', sans-serif;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--neon-green);
          overflow-x: hidden;
        }

        .cyber-container {
          border: 2px solid var(--neon-green);
          box-shadow: var(--glow);
          padding: 2rem;
          max-width: 600px;
          width: 90%;
          position: relative;
          background: rgba(0, 0, 0, 0.8);
        }

        .cyber-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          text-shadow: var(--glow);
          position: relative;
        }

        .cyber-input {
          width: 100%;
          padding: 1rem;
          margin: 1rem 0;
          background: transparent;
          border: 2px solid var(--neon-green);
          color: var(--neon-green);
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .cyber-input:focus {
          outline: none;
          box-shadow: var(--glow);
        }

        .cyber-button {
          background: transparent;
          border: 2px solid var(--neon-green);
          color: var(--neon-green);
          padding: 1rem 2rem;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        .cyber-button:hover {
          background: var(--neon-green);
          color: var(--dark-bg);
          box-shadow: var(--glow);
        }

        .result-box {
          margin-top: 2rem;
          padding: 1rem;
          border: 1px dashed var(--neon-green);
          position: relative;
        }

        .preview-media {
          max-width: 100%;
          margin: 1rem 0;
          border: 2px solid var(--neon-green);
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      </style>
    </head>
    <body>
      <div class="cyber-container">
        <h1 class="cyber-title">NWBE DOWNLOADER ☣️</h1>
        <input type="text" class="cyber-input" id="pinUrl" placeholder="ENTER PINTEREST URL">
        <button class="cyber-button" onclick="downloadMedia()">EXTRACT MEDIA</button>
        
        <div class="result-box" id="result">
          <div id="previewContainer"></div>
          <div id="output"></div>
        </div>
      </div>

      <script>
        async function downloadMedia() {
          const url = document.getElementById('pinUrl').value;
          const output = document.getElementById('output');
          const preview = document.getElementById('previewContainer');
          output.innerHTML = '<div class="loading">PROCESSING...</div>';
          preview.innerHTML = '';

          try {
            const response = await fetch('/api/download?url=' + encodeURIComponent(url));
            const data = await response.json();

            if (data.error) {
              output.innerHTML = \`<div class="error">ERROR: \${data.error}</div>\`;
            } else {
              output.innerHTML = \`
                <div class="success">
                  MEDIA FOUND!<br>
                  <button onclick="downloadFile('\${data.mediaUrl}')" class="cyber-button">
                    DOWNLOAD NOW
                  </button>
                </div>
              \`;
              
              // Media preview
              if (data.mediaUrl.match(/\.(mp4|mov)$/i)) {
                preview.innerHTML = \`
                  <video controls class="preview-media">
                    <source src="\${data.mediaUrl}" type="video/mp4">
                  </video>
                \`;
              } else {
                preview.innerHTML = \`
                  <img src="\${data.mediaUrl}" class="preview-media" alt="Preview">
                \`;
              }
            }
          } catch (error) {
            output.innerHTML = \`<div class="error">CONNECTION FAILED</div>\`;
          }
        }

        function downloadFile(url) {
          const link = document.createElement('a');
          link.href = url;
          link.download = 'nwbe-download' + (url.match(/\.mp4/) ? '.mp4' : '.jpg');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      </script>
    </body>
    </html>
  `;
}
