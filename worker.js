addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Expose-Headers': 'Content-Disposition'
}

const allowedDomains = [
  'freeterabox.com',
  'www.freeterabox.com',
  'terafileshare.com',
  'www.terabox.club'
]

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'

async function handleRequest(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  const url = new URL(request.url)
  const path = url.pathname
  const params = url.searchParams

  // API endpoint for getting video info
  if (path === '/api/info' && params.has('url')) {
    return getVideoInfo(params.get('url'))
  }

  // Download endpoint
  if (path === '/download' && params.has('url')) {
    return handleDownload(params.get('url'), request)
  }

  // Default response
  return new Response(JSON.stringify({
    endpoints: {
      '/api/info?url=[terabox_url]': 'Get video information',
      '/download?url=[terabox_url]': 'Download video file'
    },
    supported_domains: allowedDomains
  }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  })
}

async function getVideoInfo(videoUrl) {
  try {
    // Validate URL
    const url = new URL(videoUrl)
    if (!allowedDomains.includes(url.hostname)) {
      throw new Error('Domain not allowed')
    }

    // Fetch the page to extract info
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': userAgent
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`)
    }

    const html = await response.text()
    
    // Extract video information from HTML (adjust based on actual page structure)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : 'Untitled'
    
    // Improved extraction logic for video URL
    const videoUrlMatch = html.match(/["'](https?:\/\/[^"']+\.mp4)["']/i)
    const directUrl = videoUrlMatch ? videoUrlMatch[1] : null
    
    if (!directUrl) {
      throw new Error('Could not extract video URL')
    }

    // Get video headers to determine size
    const headResponse = await fetch(directUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': userAgent,
        'Referer': videoUrl
      }
    })

    const contentLength = headResponse.headers.get('content-length')
    const lastModified = headResponse.headers.get('last-modified') || new Date().toUTCString()
    const contentType = headResponse.headers.get('content-type') || 'video/mp4'

    return new Response(JSON.stringify({
      success: true,
      data: {
        filename: `${title.replace(/[^\w.-]/g, '_')}.mp4`,
        size: contentLength ? parseInt(contentLength) : null,
        date: lastModified,
        type: contentType,
        direct_url: directUrl,
        source_url: videoUrl
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

async function handleDownload(videoUrl, originalRequest) {
  try {
    // First get video info to get the direct URL
    const infoResponse = await getVideoInfo(videoUrl)
    if (!infoResponse.ok) return infoResponse
    
    const info = await infoResponse.json()
    if (!info.success) {
      return new Response(JSON.stringify(info), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      })
    }

    // Fetch the video stream
    const videoResponse = await fetch(info.data.direct_url, {
      headers: {
        'User-Agent': userAgent,
        'Referer': videoUrl,
        'Range': originalRequest.headers.get('Range') || ''
      }
    })

    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.status}`)
    }

    // Create a new response with the video stream and appropriate headers
    const responseHeaders = new Headers(videoResponse.headers)
    responseHeaders.set('Content-Disposition', `attachment; filename="${info.data.filename}"`)
    responseHeaders.set('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin'])
    responseHeaders.set('Access-Control-Expose-Headers', corsHeaders['Access-Control-Expose-Headers'])
    responseHeaders.set('Content-Type', info.data.type)

    return new Response(videoResponse.body, {
      status: videoResponse.status,
      headers: responseHeaders
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
}
