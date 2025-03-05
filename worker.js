addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const XHAMSTER_HEADERS = {
  'Host': 'xhamster.com',
  'User-Agent': randomizeUserAgent(),
  'DNT': '1',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Cache-Control': 'max-age=0',
  'TE': 'trailers'
}

function randomizeUserAgent() {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]
  return agents[Math.floor(Math.random() * agents.length)]
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const videoUrl = url.searchParams.get('url')
  const editAction = url.searchParams.get('edit') // For API editing
  const cookie = url.searchParams.get('cookie')

  if (!videoUrl) {
    return new Response('Missing video URL parameter', { status: 400 })
  }

  try {
    // Add cookie to headers if provided
    const headers = { ...XHAMSTER_HEADERS }
    if (cookie) {
      headers['Cookie'] = cookie
    }

    // Determine URL type
    const urlType = videoUrl.includes('xhamster.com/videos') ? 'video' :
                   videoUrl.includes('xhamster.com/my') ? 'playlist' :
                   null

    if (!urlType) {
      return new Response('Invalid xHamster URL', { status: 400 })
    }

    // Fetch initial content
    const response = await fetch(videoUrl, { headers })
    
    if (response.status === 403) {
      return new Response('403 Forbidden - Check cookies', { status: 403 })
    }
    if (response.status !== 200) {
      return new Response(`Failed with status: ${response.status}`, { status: response.status })
    }

    if (urlType === 'playlist') {
      return await handlePlaylist(videoUrl, headers, editAction)
    } else {
      return await handleVideo(videoUrl, headers, editAction)
    }

  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}

async function handlePlaylist(baseUrl, headers, editAction) {
  let videos = []
  let page = 0
  const standardizedUrl = standardizeUrl(baseUrl)

  while (true) {
    page++
    const pageUrl = standardizedUrl.replace('{}', page.toString().padStart(2, '0'))
    const response = await fetch(pageUrl, { headers })
    
    if (response.status === 404) break
    if (response.status !== 200) {
      return new Response(`Playlist page ${page} failed: ${response.status}`, { status: response.status })
    }

    const html = await response.text()
    if (html.includes('<title>Page not found</title>')) break

    const videoUrls = extractVideoUrls(html)
    videos = videos.concat(videoUrls.filter(url => 
      url.includes('com/videos') && !url.includes('com/videos/recommended')
    ))

    if (videoUrls.length === 0) break
  }

  if (editAction) {
    return await processVideoEditing(videos, editAction)
  }

  return new Response(JSON.stringify({ videos }), {
    headers: { 'Content-Type': 'application/json' }
  })
}

async function handleVideo(videoUrl, headers, editAction) {
  const response = await fetch(videoUrl, { headers })
  const html = await response.text()
  
  const videoInfo = await extractVideoInfo(html)
  
  if (editAction) {
    return await processVideoEditing([videoUrl], editAction)
  }

  return new Response(JSON.stringify(videoInfo), {
    headers: { 'Content-Type': 'application/json' }
  })
}

function standardizeUrl(url) {
  return url.endsWith('/') ? `${url}{}` : `${url}/{}` 
}

function extractVideoUrls(html) {
  const urls = []
  const regex = /href=["'](https:\/\/xhamster\.com\/videos\/[^"']+)["']/g
  let match
  while ((match = regex.exec(html)) !== null) {
    urls.push(match[1])
  }
  return urls
}

async function extractVideoInfo(html) {
  const titleMatch = html.match(/<title>(.*?) - xHamster/i)
  const videoMatch = html.match(/"mp4File":"(https:\/\/[^"]+\.mp4)"/)
  
  return {
    title: titleMatch ? titleMatch[1] : 'Unknown',
    url: videoMatch ? videoMatch[1] : null
  }
}

async function processVideoEditing(videoUrls, editAction) {
  // Basic editing API simulation - in practice, you'd integrate with a video processing service
  const editedVideos = videoUrls.map(url => ({
    originalUrl: url,
    editedUrl: `${url}?edited=${editAction}`,
    action: editAction,
    status: 'processed'
  }))

  return new Response(JSON.stringify({ editedVideos }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
    
