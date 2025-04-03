addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  }

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({
      status: false,
      transcript: "Method not allowed",
      credit: "https://t.me/Teleservices_Api"
    }), { status: 405, headers })
  }

  // Parse URL parameters
  const url = new URL(request.url)
  const videoUrl = url.searchParams.get('url')
  const formatParam = url.searchParams.get('format')
  const format = formatParam ? formatParam.toLowerCase() === 'true' : true

  if (!videoUrl) {
    return new Response(JSON.stringify({
      status: false,
      transcript: "Not available",
      credit: "https://t.me/Teleservices_Api"
    }), { headers })
  }

  try {
    const transcript = await getYoutubeTranscript(videoUrl, format)
    return new Response(JSON.stringify(transcript), { headers })
  } catch (error) {
    return new Response(JSON.stringify({
      status: false,
      transcript: "Error fetching transcript",
      credit: "https://t.me/Teleservices_Api"
    }), { status: 500, headers })
  }
}

async function getYoutubeTranscript(videoUrl, format = true) {
  // Extract video ID
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\?&"'>]+)/
  const match = videoUrl.match(regex)
  
  if (!match || !match[1]) {
    return {
      status: false,
      transcript: "Not available",
      credit: "https://t.me/Teleservices_Api"
    }
  }
  
  const videoId = match[1]

  // Prepare the POST data
  const postData = JSON.stringify({
    video_id: videoId,
    format: format
  })

  // Make the API request
  const apiUrl = "https://api.kome.ai/api/tools/youtube-transcripts"
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length.toString()
    },
    body: postData
  })

  if (!response.ok) {
    return {
      status: false,
      transcript: "",
      credit: "https://t.me/Teleservices_Api"
    }
  }

  const responseData = await response.json()

  if (!responseData.transcript) {
    return {
      status: false,
      transcript: "Not available",
      credit: "https://t.me/Teleservices_Api"
    }
  }

  return {
    status: true,
    transcript: responseData.transcript,
    credit: 'https://t.me/Teleservices_Api'
  }
}
