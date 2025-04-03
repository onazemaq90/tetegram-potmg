addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
    'Content-Type': 'application/json'
  }

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  // Handle Telegram bot updates (POST requests)
  if (request.method === 'POST') {
    try {
      const update = await request.json()
      return handleTelegramUpdate(update, headers)
    } catch (error) {
      return new Response(JSON.stringify({
        status: false,
        error: "Invalid request format"
      }), { status: 400, headers })
    }
  }

  // Handle direct API requests (GET requests)
  if (request.method === 'GET') {
    const url = new URL(request.url)
    const videoUrl = url.searchParams.get('url')
    const formatParam = url.searchParams.get('format')
    const format = formatParam ? formatParam.toLowerCase() === 'true' : true

    if (!videoUrl) {
      return new Response(JSON.stringify({
        status: false,
        transcript: "YouTube URL parameter is required",
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

  return new Response(JSON.stringify({
    status: false,
    message: "Method not allowed"
  }), { status: 405, headers })
}

async function handleTelegramUpdate(update, headers) {
  // Check if this is a message update
  if (!update.message || !update.message.text) {
    return new Response(JSON.stringify({ status: true }), { headers }
  }

  const message = update.message.text
  const chatId = update.message.chat.id
  const botToken = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY' // Replace with your bot token

  // Handle /start command
  if (message.startsWith('/start')) {
    const welcomeMessage = `🎬 *YouTube Transcript Bot*\n\nSend me a YouTube URL and I'll fetch the transcript for you!\n\nCredit: @Teleservices_Api`
    
    await sendTelegramMessage(botToken, chatId, welcomeMessage, true)
    return new Response(JSON.stringify({ status: true }), { headers }
  }

  // Handle YouTube URLs
  if (isYoutubeUrl(message)) {
    try {
      // Send "processing" message
      await sendTelegramMessage(botToken, chatId, "⏳ Processing your YouTube video...", false)
      
      // Get transcript
      const transcript = await getYoutubeTranscript(message, true)
      const response = JSON.parse(transcript)
      
      if (response.status && response.transcript) {
        // Format the response for Telegram
        let replyText = `📝 *Transcript*:\n\n${response.transcript}\n\n`
        replyText += `_Credit: ${response.credit}_`
        
        // Send transcript (Telegram has 4096 character limit per message)
        if (replyText.length <= 4096) {
          await sendTelegramMessage(botToken, chatId, replyText, true)
        } else {
          // Split long messages
          const parts = splitMessage(replyText, 4096)
          for (const part of parts) {
            await sendTelegramMessage(botToken, chatId, part, true)
            await new Promise(resolve => setTimeout(resolve, 1000)) // Delay between messages
          }
        }
      } else {
        await sendTelegramMessage(botToken, chatId, "❌ Sorry, I couldn't fetch the transcript for this video.", false)
      }
    } catch (error) {
      await sendTelegramMessage(botToken, chatId, "❌ An error occurred while processing your request.", false)
    }
    return new Response(JSON.stringify({ status: true }), { headers })
  }

  // Handle non-YouTube messages
  await sendTelegramMessage(botToken, chatId, "Please send me a valid YouTube URL to get the transcript.", false)
  return new Response(JSON.stringify({ status: true }), { headers })
}

async function getYoutubeTranscript(videoUrl, format = true) {
  // Extract video ID
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\?&"'>]+)/
  const match = videoUrl.match(regex)
  
  if (!match || !match[1]) {
    return JSON.stringify({
      status: false,
      transcript: "Not available",
      credit: "https://t.me/Teleservices_Api"
    })
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
    return JSON.stringify({
      status: false,
      transcript: "",
      credit: "https://t.me/Teleservices_Api"
    })
  }

  const responseData = await response.json()

  if (!responseData.transcript) {
    return JSON.stringify({
      status: false,
      transcript: "Not available",
      credit: "https://t.me/Teleservices_Api"
    })
  }

  return JSON.stringify({
    status: true,
    transcript: responseData.transcript,
    credit: 'https://t.me/Teleservices_Api'
  })
}

// Helper function to send Telegram messages
async function sendTelegramMessage(botToken, chatId, text, markdown = false) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: markdown ? 'Markdown' : undefined
  }

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

// Helper function to check if a string is a YouTube URL
function isYoutubeUrl(text) {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return pattern.test(text)
}

// Helper function to split long messages
function splitMessage(text, maxLength) {
  const parts = []
  while (text.length) {
    const part = text.substring(0, maxLength)
    parts.push(part)
    text = text.substring(maxLength)
  }
  return parts
}
