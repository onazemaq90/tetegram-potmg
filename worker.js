addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // API endpoint: /api/download?url=<pinterest URL>
  if (path.startsWith("/api/download")) {
    const pinUrl = url.searchParams.get("url");
    if (!isValidPinterestUrl(pinUrl)) {
      return jsonResponse({ error: "Invalid Pinterest URL" }, 400);
    }

    try {
      const response = await fetch(pinUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch Pinterest page");
      
      const html = await response.text();
      const mediaData = extractMediaData(html);
      
      if (!mediaData) return jsonResponse({ error: "No media found" }, 404);
      
      return jsonResponse(mediaData);

    } catch (error) {
      return jsonResponse({ error: error.message || "Failed to fetch media" }, 500);
    }
  }

  // Serve the web interface
  return new Response(generateHTML(), {
    headers: { "Content-Type": "text/html" },
  });
}

function isValidPinterestUrl(url) {
  return url && /^(https?:\/\/)?(www\.)?(pinterest\.(com|it)|pin\.it)\/.*/.test(url);
}

function extractMediaData(html) {
  // Try to find JSON-LD structured data
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  if (jsonLdMatch) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      if (jsonData.image?.contentUrl) {
        return {
          url: jsonData.image.contentUrl,
          type: "image"
        };
      }
    } catch (e) { /* Fallback to other methods */ }
  }

  // Fallback: Search for video content
  const videoMatch = html.match(/"video_list":\s*({.*?}),\s*"video_audio_metadata"/s);
  if (videoMatch) {
    try {
      const videoData = JSON.parse(videoMatch[1]);
      const variants = Object.values(videoData);
      if (variants.length) {
        const bestQuality = variants.reduce((a, b) => 
          b.height * b.width > a.height * a.width ? b : a
        );
        return {
          url: bestQuality.url,
          type: "video"
        };
      }
    } catch (e) { /* Continue to other methods */ }
  }

  // Fallback: Direct image search
  const imageMatch = html.match(/"url":"(https:\/\/i\.pinimg\.com\/[^"]+\.(jpg|png|jpeg))"/);
  if (imageMatch) {
    return {
      url: imageMatch[1].replace(/\\\//g, '/'),
      type: "image"
    };
  }

  return null;
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function generateHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pinterest Media Downloader</title>
      <style>
        /* ... (keep previous styles) ... */
        .preview-container {
          margin: 20px auto;
          max-width: 90%;
          border-radius: 10px;
          overflow: hidden;
        }
        .preview-media {
          width: 100%;
          max-height: 60vh;
          object-fit: contain;
        }
        .loader {
          display: none;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #ff6f61;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>New World Best Edit</h1>
        <input type="text" id="pinUrl" placeholder="Enter Pinterest URL">
        <button onclick="downloadMedia()" id="downloadBtn">Download</button>
        <div class="loader" id="loader"></div>
        <div id="result"></div>
        <div class="preview-container" id="preview"></div>
      </div>
      <script>
        async function downloadMedia() {
          const url = document.getElementById("pinUrl").value.trim();
          const resultDiv = document.getElementById("result");
          const previewDiv = document.getElementById("preview");
          const loader = document.getElementById("loader");
          const btn = document.getElementById("downloadBtn");
          
          if (!url) return;
          
          btn.disabled = true;
          loader.style.display = "block";
          resultDiv.innerHTML = "";
          previewDiv.innerHTML = "";
          
          try {
            const response = await fetch(\`/api/download?url=\${encodeURIComponent(url)}\`);
            const data = await response.json();
            
            if (data.error) {
              resultDiv.innerHTML = \`Error: \${data.error}\`;
              return;
            }
            
            // Show preview
            const mediaElement = data.type === 'video' 
              ? \`<video controls class="preview-media"><source src="\${data.url}" type="video/mp4"></video>\`
              : \`<img src="\${data.url}" class="preview-media" alt="Preview">\`;
              
            previewDiv.innerHTML = mediaElement;
            resultDiv.innerHTML = \`
              <p>Media found (\${data.type})</p>
              <a href="\${data.url}" download target="_blank" class="download-link">
                Download \${data.type.toUpperCase()}
              </a>
            \`;
            
          } catch (error) {
            resultDiv.innerHTML = "Error: Unable to fetch media.";
          } finally {
            btn.disabled = false;
            loader.style.display = "none";
          }
        }
      </script>
    </body>
    </html>
  `;
}
                                            
