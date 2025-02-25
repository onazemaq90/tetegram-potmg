// cloudflare-worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Serve HTML page for root path
    if (path === '/' && request.method === 'GET') {
      return serveHtml();
    }

    // Handle API requests
    if (path === '/api' && request.method === 'POST') {
      return handleApiRequest(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};

async function serveHtml() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>YouTube Audio Downloader</title>
      <style>
        :root {
          --primary: #ff4757;
          --secondary: #2ed573;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', sans-serif;
        }
        
        body {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e1e1e, #2d3436);
          color: white;
          padding: 2rem;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        
        h1 {
          margin-bottom: 2rem;
          font-size: 2.5rem;
          background: linear-gradient(45deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .input-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        input {
          flex: 1;
          padding: 1rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          background: var(--primary);
          color: white;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        button:hover {
          transform: translateY(-2px);
          background: #ff6b81;
        }
        
        #result {
          padding: 2rem;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          text-align: left;
          white-space: pre-wrap;
        }
        
        .loader {
          display: none;
          border: 4px solid rgba(255,255,255,0.1);
          border-top: 4px solid var(--secondary);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>YouTube Audio Downloader</h1>
        <div class="input-group">
          <input type="text" id="videoUrl" placeholder="Enter YouTube URL...">
          <button onclick="handleConvert()">Convert</button>
        </div>
        <div class="loader" id="loader"></div>
        <div id="result"></div>
      </div>
      
      <script>
        async function handleConvert() {
          const videoUrl = document.getElementById('videoUrl').value;
          const loader = document.getElementById('loader');
          const resultDiv = document.getElementById('result');
          
          if (!videoUrl) {
            alert('Please enter a YouTube URL');
            return;
          }
          
          try {
            loader.style.display = 'block';
            resultDiv.textContent = '';
            
            const response = await fetch('/api', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ url: videoUrl })
            });
            
            const data = await response.json();
            resultDiv.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultDiv.textContent = 'Error: ' + error.message;
          } finally {
            loader.style.display = 'none';
          }
        }
      </script>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}

async function handleApiRequest(request) {
  try {
    const { url } = await request.json();
    const videoId = extractYouTubeId(url);
    
    const apiUrl = `https://youtube-mp3-audio-video-downloader.p.rapidapi.com/get_m4a_download_link/${videoId}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70',
        'x-rapidapi-host': 'youtube-mp3-audio-video-downloader.p.rapidapi.com'
      }
    };

    const response = await fetch(apiUrl, options);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
