addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  const url = new URL(request.url)
  const path = url.pathname
  const host = url.hostname

  // Allowed domains
  const allowedDomains = [
    'freeterabox.com',
    'www.freeterabox.com',
    'terafileshare.com'
  ]

  // Check if request is coming from allowed domain
  if (!allowedDomains.includes(host)) {
    return new Response('Forbidden', { status: 403 })
  }

  // API endpoint for getting video info
  if (path.startsWith('/api/info')) {
    return handleVideoInfoRequest(request)
  }

  // Download endpoint
  if (path.startsWith('/download')) {
    return handleDownloadRequest(request)
  }

  // Default response
  return new Response(JSON.stringify({
    endpoints: {
      '/api/info?url=[video_url]': 'Get video information',
      '/download?url=[video_url]': 'Download video as MP4'
    }
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  })
}

async function handleVideoInfoRequest(request) {
  const url = new URL(request.url)
  const videoUrl = url.searchParams.get('url')

  if (!videoUrl) {
    return new Response(JSON.stringify({ error: 'Missing video URL parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }

  try {
    // Fetch the video headers to get info without downloading the whole file
    const headResponse = await fetch(videoUrl, { method: 'HEAD' })
    
    if (!headResponse.ok) {
      throw new Error('Failed to fetch video info')
    }

    // Extract filename from URL or Content-Disposition header
    let filename = videoUrl.split('/').pop()
    const contentDisposition = headResponse.headers.get('Content-Disposition')
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/)
      if (match) filename = match[1]
    }

    // Ensure filename ends with .mp4
    if (!filename.toLowerCase().endsWith('.mp4')) {
      filename = filename.split('?')[0] + '.mp4'
    }

    // Get file size
    const size = headResponse.headers.get('Content-Length') || 'unknown'

    // Get last modified date
    const lastModified = headResponse.headers.get('Last-Modified') || new Date().toUTCString()

    // Response with video info
    return new Response(JSON.stringify({
      filename,
      size,
      lastModified,
      type: headResponse.headers.get('Content-Type'),
      url: videoUrl
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

async function handleDownloadRequest(request) {
  const url = new URL(request.url)
  const videoUrl = url.searchParams.get('url')

  if (!videoUrl) {
    return new Response('Missing video URL parameter', { status: 400 })
  }

  try {
    // Fetch the video
    const videoResponse = await fetch(videoUrl)

    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video')
    }

    // Extract filename
    let filename = videoUrl.split('/').pop()
    const contentDisposition = videoResponse.headers.get('Content-Disposition')
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/)
      if (match) filename = match[1]
    }

    // Ensure filename ends with .mp4
    if (!filename.toLowerCase().endsWith('.mp4')) {
      filename = filename.split('?')[0] + '.mp4'
    }

    // Create a new response with the video and appropriate headers
    const response = new Response(videoResponse.body, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
        ...corsHeaders
      }
    })

    return response

  } catch (error) {
    return new Response(error.message, { status: 500 })
  }
}

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
}

// Custom user agent
const customUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
