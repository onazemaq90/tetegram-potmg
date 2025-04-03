addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const ALLOWED_DOMAINS = [
  'freeterabox.com',
  'www.freeterabox.com',
  'terafileshare.com'
]

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/info')) {
    return handleVideoInfo(request)
  }

  // Handle video downloads
  if (url.pathname.endsWith('.mp4')) {
    return handleVideoDownload(request)
  }

  return new Response('Not Found', { status: 404 })
}

async function handleVideoDownload(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // Validate allowed domains
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    return new Response('Forbidden', { status: 403 })
  }

  const originUrl = `https://terabox.com${pathname.replace('/download/', '/')}`
  
  const modifiedHeaders = new Headers(request.headers)
  modifiedHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36')

  const response = await fetch(originUrl, {
    headers: modifiedHeaders
  })

  const newHeaders = new Headers(response.headers)
  newHeaders.set('Content-Type', 'video/mp4')
  newHeaders.set('Access-Control-Allow-Origin', '*')

  return new Response(response.body, {
    status: response.status,
    headers: newHeaders
  })
}

async function handleVideoInfo(request) {
  const url = new URL(request.url)
  const videoUrl = url.searchParams.get('url')

  if (!videoUrl) {
    return new Response('Missing video URL', { 
      status: 400,
      headers: corsHeaders
    })
  }

  try {
    const infoResponse = await fetch(videoUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
      }
    })

    if (!infoResponse.ok) {
      throw new Error('Failed to fetch video info')
    }

    const videoInfo = {
      filename: getFileName(infoResponse.headers.get('Content-Disposition') || videoUrl),
      size: infoResponse.headers.get('Content-Length'),
      date: infoResponse.headers.get('Last-Modified'),
      type: infoResponse.headers.get('Content-Type')
    }

    return new Response(JSON.stringify(videoInfo), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
}

function getFileName(header) {
  const match = header.match(/filename="?(.+?)"?(;|$)/)
  return match ? match[1] : 'video.mp4'
}
