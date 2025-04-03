addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';
  const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);

  // API endpoint for video info
  if (url.pathname === '/api/video-info') {
    return handleVideoInfoAPI(request);
  }

  // Handle download requests
  if (url.pathname.startsWith('/download')) {
    return handleDownloadRequest(request);
  }

  // Main page
  if (url.pathname === '/' || url.pathname === '') {
    return new Response(htmlHomePage, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  // Proxy requests for allowed domains
  const allowedDomains = ['freeterabox.com', 'www.freeterabox.com', 'terafileshare.com', 'www.terabox.club'];
  if (allowedDomains.includes(url.hostname)) {
    return proxyRequest(request);
  }

  return new Response('Not Found', { status: 404 });
}

async function handleVideoInfoAPI(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const allowedDomains = ['freeterabox.com', 'www.freeterabox.com', 'terafileshare.com', 'www.terabox.club'];
    const urlObj = new URL(videoUrl);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch the video page
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = await response.text();
    const videoInfo = await extractVideoInfo(html, videoUrl);

    return new Response(JSON.stringify(videoInfo), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function extractVideoInfo(html, originalUrl) {
  // Extract title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : 'Video Download';

  // Extract video URL
  const videoUrlMatch = html.match(/<video.*?src="(.*?)"/i) || 
                       html.match(/source.*?src="(.*?)"/i) ||
                       html.match(/file:\s*"(.*?)"/i);
  const videoUrl = videoUrlMatch ? makeAbsoluteUrl(videoUrlMatch[1], originalUrl) : null;

  // Extract additional metadata if video URL is found
  let size = null, date = null, filename = null;
  if (videoUrl) {
    const videoResponse = await fetch(videoUrl, { method: 'HEAD' });
    size = videoResponse.headers.get('content-length');
    date = videoResponse.headers.get('last-modified');
    filename = videoUrl.split('/').pop();
  }

  // Extract thumbnail URL
  const thumbnailMatch = html.match(/<img.*?class="thumbnail".*?src="(.*?)"/i) || 
                        html.match(/<meta.*?property="og:image".*?content="(.*?)"/i);
  const thumbnailUrl = thumbnailMatch ? makeAbsoluteUrl(thumbnailMatch[1], originalUrl) : null;

  // Extract duration (if available in HTML, customize as needed)
  const durationMatch = html.match(/duration.*?(\d+:\d+)/i);
  const duration = durationMatch ? durationMatch[1] : null;

  return {
    title,
    originalUrl,
    videoUrl,
    filename: filename || (videoUrl ? videoUrl.split('/').pop() : null),
    size: size ? `${(size / (1024 * 1024)).toFixed(2)} MB` : null,
    date: date || null,
    thumbnailUrl,
    duration
  };
}

function makeAbsoluteUrl(url, baseUrl) {
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  const base = new URL(baseUrl);
  if (url.startsWith('/')) {
    return `${base.protocol}//${base.host}${url}`;
  }
  return `${base.protocol}//${base.host}${base.pathname.split('/').slice(0, -1).join('/')}/${url}`;
}

async function handleDownloadRequest(request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return new Response('URL parameter is required', { status: 400 });
    }

    const allowedDomains = ['freeterabox.com', 'www.freeterabox.com', 'terafileshare.com', 'www.terabox.club'];
    const urlObj = new URL(videoUrl);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return new Response('Domain not allowed', { status: 403 });
    }

    const videoResponse = await fetch(videoUrl, {
      headers: {
        'Referer': urlObj.origin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!videoResponse.ok) {
      return new Response('Failed to fetch video', { status: videoResponse.status });
    }

    let filename = videoUrl.split('/').pop();
    const contentDisposition = videoResponse.headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.*?)"?$/i);
      if (filenameMatch) filename = filenameMatch[1];
    }
    if (!filename.toLowerCase().endsWith('.mp4')) {
      filename = filename.split('.')[0] + '.mp4';
    }

    const headers = new Headers(videoResponse.headers);
    headers.set('content-disposition', `attachment; filename="${filename}"`);
    headers.delete('content-security-policy');
    headers.delete('x-frame-options');

    return new Response(videoResponse.body, {
      status: videoResponse.status,
      headers
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}

async function proxyRequest(request) {
  const url = new URL(request.url);
  const newRequest = new Request(request);
  newRequest.headers.set('X-Forwarded-Host', url.hostname);

  const response = await fetch(url.toString(), newRequest);
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', '*');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');

  return newResponse;
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
            background: #f0f2f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type="text"] {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
            font-size: 16px;
        }
        button {
            background: #0066ff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        button:hover {
            background: #0055dd;
        }
        #result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            background: #f9f9f9;
            display: none;
        }
        .video-info {
            margin-bottom: 15px;
        }
        .thumbnail {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-top: 10px;
        }
        .download-btn {
            display: inline-block;
            margin-top: 10px;
            text-decoration: none;
            background: #28a745;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            transition: background 0.3s;
        }
        .download-btn:hover {
            background: #218838;
        }
        .error {
            color: #dc3545;
            margin-top: 10px;
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
                <img id="thumbnail" class="thumbnail" src="" alt="Thumbnail" style="display: none;" />
                <a id="downloadLink" class="download-btn" href="#" target="_blank">Download MP4</a>
            </div>
        </div>
    </div>

    <script>
        async function getVideoInfo() {
            const videoUrl = document.getElementById('videoUrl').value.trim();
            if (!videoUrl) {
                alert('Please enter a video URL');
                return;
            }

            try {
                const response = await fetch('/api/video-info?url=' + encodeURIComponent(videoUrl));
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }

                document.getElementById('videoTitle').textContent = data.title || 'Video Download';
                
                let details = '';
                if (data.filename) details += `<strong>Filename:</strong> ${data.filename}<br>`;
                if (data.size) details += `<strong>Size:</strong> ${data.size}<br>`;
                if (data.date) details += `<strong>Date:</strong> ${new Date(data.date).toLocaleString()}<br>`;
                if (data.duration) details += `<strong>Duration:</strong> ${data.duration}<br>`;
                
                document.getElementById('videoDetails').innerHTML = details || 'No additional details available.';
                
                const thumbnail = document.getElementById('thumbnail');
                if (data.thumbnailUrl) {
                    thumbnail.src = data.thumbnailUrl;
                    thumbnail.style.display = 'block';
                } else {
                    thumbnail.style.display = 'none';
                }

                const downloadLink = document.getElementById('downloadLink');
                if (data.videoUrl) {
                    downloadLink.href = '/download?url=' + encodeURIComponent(data.videoUrl);
                    downloadLink.style.display = 'inline-block';
                } else {
                    downloadLink.style.display = 'none';
                }
                
                document.getElementById('result').style.display = 'block';
            } catch (error) {
                document.getElementById('result').innerHTML = `<p class="error">Error: ${error.message}</p>`;
                document.getElementById('result').style.display = 'block';
                console.error(error);
            }
        }
    </script>
</body>
</html>
`;
