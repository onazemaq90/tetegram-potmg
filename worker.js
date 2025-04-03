addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Expose-Headers': 'Content-Disposition'
}

const ALLOWED_DOMAINS = [
  'freeterabox.com',
  'www.freeterabox.com',
  'terafileshare.com',
  'www.terabox.club'
]

const CUSTOM_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  // API endpoint for getting video info
  if (url.pathname === '/api/info' && targetUrl) {
    return getVideoInfo(targetUrl)
  }

  // Direct download endpoint
  if (url.pathname === '/api/download' && targetUrl) {
    return handleDownload(targetUrl, request)
  }

  // Default response
  return new Response(JSON.stringify({
    endpoints: {
      info: '/api/info?url=[TeraBox_URL]',
      download: '/api/download?url=[TeraBox_URL]'
    },
    allowed_domains: ALLOWED_DOMAINS
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  })
}

async function getVideoInfo(targetUrl) {
  try {
    const targetDomain = new URL(targetUrl).hostname
    if (!ALLOWED_DOMAINS.includes(targetDomain)) {
      throw new Error('Domain not allowed')
    }

    // Fetch the page to extract video info
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': CUSTOM_USER_AGENT
      }
    })
    
    const html = await response.text()
    
    // This is a simplified example - you'll need to adjust the parsing for the specific site
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const videoMatch = html.match(/<video.*?src="(.*?)"/i)
    
    if (!videoMatch || !videoMatch[1]) {
      throw new Error('Video URL not found in page')
    }
    
    const videoUrl = videoMatch[1].startsWith('http') ? videoMatch[1] : new URL(videoMatch[1], targetUrl).toString()
    
    // Get video headers to determine size
    const headResponse = await fetch(videoUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': CUSTOM_USER_AGENT
      }
    })
    
    const contentLength = headResponse.headers.get('content-length')
    const contentType = headResponse.headers.get('content-type') || 'video/mp4'
    const lastModified = headResponse.headers.get('last-modified') || new Date().toUTCString()
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        title: titleMatch ? titleMatch[1] : 'Untitled',
        url: videoUrl,
        download_url: `${new URL(request.url).origin}/api/download?url=${encodeURIComponent(targetUrl)}`,
        size: contentLength ? parseInt(contentLength) : null,
        type: contentType,
        last_modified: lastModified,
        filename: titleMatch ? `${titleMatch[1].replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.mp4` : 'video.mp4'
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
}

async function handleDownload(targetUrl, originalRequest) {
  try {
    const targetDomain = new URL(targetUrl).hostname
    if (!ALLOWED_DOMAINS.includes(targetDomain)) {
      throw new Error('Domain not allowed')
    }

    // First get video info to determine the actual video URL
    const infoResponse = await getVideoInfo(targetUrl)
    const info = await infoResponse.json()
    
    if (!info.success || !info.data.url) {
      throw new Error('Could not retrieve video information')
    }
    
    const videoUrl = info.data.url
    
    // Fetch the video with streaming
    const videoResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': CUSTOM_USER_AGENT,
        'Range': originalRequest.headers.get('Range') || '',
        'Referer': targetUrl
      }
    })
    
    // Create a new response with the video stream and appropriate headers
    const response = new Response(videoResponse.body, {
      status: videoResponse.status,
      statusText: videoResponse.statusText,
      headers: {
        ...corsHeaders,
        'Content-Type': info.data.type || 'video/mp4',
        'Content-Length': videoResponse.headers.get('Content-Length') || info.data.size || '',
        'Content-Disposition': `attachment; filename="${info.data.filename}"`,
        'Accept-Ranges': 'bytes',
        'Last-Modified': info.data.last_modified
      }
    })
    
    // Copy relevant headers from the video response
    const headersToCopy = ['Content-Range', 'Content-Length']
    headersToCopy.forEach(header => {
      if (videoResponse.headers.has(header)) {
        response.headers.set(header, videoResponse.headers.get(header))
      }
    })
    
    return response
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
}
