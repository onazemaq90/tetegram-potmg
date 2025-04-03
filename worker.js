// Cloudflare Worker for handling video downloads from specified domains
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const userAgent = request.headers.get('User-Agent') || ''
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent)

  // API endpoint for getting video info
  if (url.pathname === '/api/video-info') {
    return handleVideoInfoAPI(request)
  }

  // Handle download requests
  if (url.pathname.startsWith('/download')) {
    return handleDownloadRequest(request)
  }

  // Main page
  if (url.pathname === '/' || url.pathname === '') {
    return new Response(htmlHomePage, {
      headers: { 'Content-Type': 'text/html' }
    })
  }

  // For other requests, proxy to the original site if it's one of our target domains
  const allowedDomains = ['freeterabox.com', 'www.freeterabox.com', 'terafileshare.com']
  if (allowedDomains.includes(url.hostname)) {
    return proxyRequest(request)
  }

  return new Response('Not Found', { status: 404 })
}

async function handleVideoInfoAPI(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    
    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate the URL is from allowed domains
    const allowedDomains = ['freeterabox.com', 'www.freeterabox.com', 'terafileshare.com']
    const urlObj = new URL(videoUrl)
    if (!allowedDomains.includes(urlObj.hostname)) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch the video page to extract information
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const html = await response.text()
    
    // Extract video information (this will need to be customized based on the actual site structure)
    const videoInfo = extractVideoInfo(html, videoUrl)
    
    return new Response(JSON.stringify(videoInfo), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function extractVideoInfo(html, originalUrl) {
  // This is a placeholder - you'll need to customize this based on the actual HTML structure
  // of the sites you're working with
  
  // Example for terafileshare.com (you'll need to inspect their page to get correct selectors)
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1] : 'Video Download'
  
  // Look for video sources in the HTML
  const videoUrlMatch = html.match(/<video.*?src="(.*?)"/i) || 
                       html.match(/source.*?src="(.*?)"/i) ||
                       html.match(/file:\s*"(.*?)"/i)
  
  const videoUrl = videoUrlMatch ? videoUrlMatch[1] : null
  
  return {
    title,
    originalUrl,
    videoUrl: videoUrl ? makeAbsoluteUrl(videoUrl, originalUrl) : null,
    thumbnailUrl: null, // You can extract this similarly if available
    duration: null,     // Extract if available
    filename: videoUrl ? videoUrl.split('/').pop() : null
  }
}

function makeAbsoluteUrl(url, baseUrl) {
  if (url.startsWith('http')) return url
  if (url.startsWith('//')) return `https:${url}`
  
  const base = new URL(baseUrl)
  if (url.startsWith('/')) {
    return `${base.protocol}//${base.host}${url}`
  }
  
  return `${base.protocol}//${base.host}${base.pathname.split('/').slice(0, -1).join('/')}/${url}`
}

async function handleDownloadRequest(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    
    if (!videoUrl) {
      return new Response('URL parameter is required', { status: 400 })
    }

    // Validate the URL is from allowed domains
    const allowedDomains = ['freeterabox.com', 'www.freeterabox.com', 'terafileshare.com']
    const urlObj = new URL(videoUrl)
    if (!allowedDomains.includes(urlObj.hostname)) {
      return new Response('Domain not allowed', { status: 403 })
    }

    // Fetch the video with streaming
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'Referer': urlObj.origin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!videoResponse.ok) {
      return new Response('Failed to fetch video', { status: videoResponse.status })
    }

    // Get filename from URL or content-disposition
    let filename = videoUrl.split('/').pop()
    const contentDisposition = videoResponse.headers.get('content-disposition')
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.*?)"?$/i)
      if (filenameMatch) filename = filenameMatch[1]
    }

    // Ensure filename ends with .mp4
    if (!filename.toLowerCase().endsWith('.mp4')) {
      filename = filename.split('.')[0] + '.mp4'
    }

    // Create new headers
    const headers = new Headers(videoResponse.headers)
    headers.set('content-disposition', `attachment; filename="${filename}"`)
    headers.delete('content-security-policy')
    headers.delete('x-frame-options')

    return new Response(videoResponse.body, {
      status: videoResponse.status,
      headers: headers
    })
    
  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}

async function proxyRequest(request) {
  const url = new URL(request.url)
  const newRequest = new Request(request)
  
  // Modify headers if needed
  newRequest.headers.set('X-Forwarded-Host', url.hostname)
  
  // Add CORS headers if this is an API request
  const response = await fetch(url.toString(), newRequest)
  const newResponse = new Response(response.body, response)
  
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return newResponse
}

const htmlHomePage = `
<!DOCTYPE html>
<html>
<head>
    <title>Video Downloader</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type="text"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            background: #0066ff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #0055dd;
        }
        #result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            display: none;
        }
        .video-info {
            margin-bottom: 15px;
        }
        .download-btn {
            display: inline-block;
            margin-top: 10px;
            text-decoration: none;
            background: #28a745;
            color: white;
            padding: 8px 15px;
            border-radius: 4px;
        }
        .download-btn:hover {
            background: #218838;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Video Downloader</h1>
        <p>Enter a video URL from freeterabox.com or terafileshare.com to download</p>
        
        <input type="text" id="videoUrl" placeholder="https://freeterabox.com/example-video" />
        <button onclick="getVideoInfo()">Get Video Info</button>
        
        <div id="result">
            <div class="video-info">
                <h3 id="videoTitle"></h3>
                <p id="videoDetails"></p>
                <a id="downloadLink" class="download-btn" href="#" target="_blank">Download MP4</a>
            </div>
        </div>
    </div>

    <script>
        async function getVideoInfo() {
            const videoUrl = document.getElementById('videoUrl').value.trim()
            if (!videoUrl) {
                alert('Please enter a video URL')
                return
            }

            try {
                const response = await fetch('/api/video-info?url=' + encodeURIComponent(videoUrl))
                const data = await response.json()
                
                if (data.error) {
                    throw new Error(data.error)
                }

                document.getElementById('videoTitle').textContent = data.title || 'Video Download'
                
                let details = ''
                if (data.duration) details += 'Duration: ' + data.duration + '<br>'
                if (data.filename) details += 'File: ' + data.filename + '<br>'
                
                document.getElementById('videoDetails').innerHTML = details
                
                if (data.videoUrl) {
                    const downloadLink = document.getElementById('downloadLink')
                    downloadLink.href = '/download?url=' + encodeURIComponent(data.videoUrl)
                    downloadLink.style.display = 'inline-block'
                } else {
                    document.getElementById('downloadLink').style.display = 'none'
                }
                
                document.getElementById('result').style.display = 'block'
            } catch (error) {
                alert('Error: ' + error.message)
                console.error(error)
            }
        }
    </script>
</body>
</html>
`
