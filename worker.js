addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Serve HTML page for root path
  if (url.pathname === '/' && !url.searchParams.has('url')) {
    return new Response(htmlPage(), {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  // Handle API requests
  try {
    const inputUrl = url.searchParams.get('url')
    
    if (!inputUrl) {
      return new Response(JSON.stringify({ error: 'Missing URL parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const apiUrl = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink'
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': 'c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70',
        'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: inputUrl })
    }

    const response = await fetch(apiUrl, options)
    const data = await response.json()

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function htmlPage() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Media Downloader</title>
    <style>
      * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      body {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f6fa;
      }
      
      .container {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      .input-group {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      input {
        flex: 1;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
      }
      
      button {
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s;
      }
      
      button:hover {
        background: #0056b3;
      }
      
      .result {
        margin-top: 20px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .download-link {
        display: block;
        margin: 10px 0;
        padding: 10px;
        background: #28a745;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        transition: background 0.3s;
      }
      
      .download-link:hover {
        background: #218838;
      }
      
      .loading {
        display: none;
        text-align: center;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Social Media Downloader</h1>
      <div class="input-group">
        <input type="url" id="urlInput" placeholder="Paste your link here...">
        <button onclick="handleDownload()">Download</button>
      </div>
      <div class="loading" id="loading">Processing...</div>
      <div class="result" id="result"></div>
    </div>

    <script>
      async function handleDownload() {
        const urlInput = document.getElementById('urlInput')
        const resultDiv = document.getElementById('result')
        const loading = document.getElementById('loading')
        
        if (!urlInput.value) {
          alert('Please enter a URL')
          return
        }

        loading.style.display = 'block'
        resultDiv.innerHTML = ''

        try {
          const response = await fetch('/?url=${encodeURIComponent(urlInput.value)}')
          const data = await response.json()
          
          if (data.error) {
            resultDiv.innerHTML = \`<div class="error">\${data.error}</div>\`
            return
          }

          // Display download links
          let html = '<h3>Download Links:</h3>'
          
          // Handle different platforms and formats
          if (data.video) {
            html += \`<a href="\${data.video}" class="download-link" download>Download Video</a>\`
          }
          
          if (data.music) {
            html += \`<a href="\${data.music}" class="download-link" download>Download Audio</a>\`
          }
          
          if (data.thumbnail) {
            html += \`<a href="\${data.thumbnail}" class="download-link">Thumbnail Image</a>\`
          }

          resultDiv.innerHTML = html

        } catch (error) {
          resultDiv.innerHTML = \`<div class="error">Error: \${error.message}</div>\`
        } finally {
          loading.style.display = 'none'
        }
      }
    </script>
  </body>
  </html>
  `
  }
