addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Configure your bot token
const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'
const API_URL = 'https://ai-api.magicstudio.com/api/ai-art-generator'

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Only POST requests are allowed', { status: 405 })
  }

  const payload = await request.json()
  
  // Handle Telegram updates
  if (payload.message && payload.message.text) {
    const chatId = payload.message.chat.id
    const messageId = payload.message.message_id
    
    // Check if the message is a command for image generation
    if (payload.message.text.startsWith('/imagine')) {
      return handleImageGeneration(payload.message)
    }
  }

  return new Response('OK', { status: 200 })
}

async function handleImageGeneration(message) {
  const prompt = message.text.replace('/imagine', '').trim()
  
  // Send "waiting" message
  const waitMessageResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: 'Please wait while I generate the image...',
      reply_to_message_id: message.message_id
    })
  })
  
  const waitMessage = await waitMessageResponse.json()
  const startTime = Date.now()

  try {
    // Call the image generation API
    const formData = {
      prompt: prompt,
      output_format: 'bytes',
      request_timestamp: Math.floor(Date.now() / 1000).toString(),
      user_is_subscribed: 'false'
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const imageData = await response.arrayBuffer()
    
    // Delete wait message
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: message.chat.id,
        message_id: waitMessage.result.message_id
      })
    })

    // Send the generated image
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2)
    
    return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: new FormData({
        chat_id: message.chat.id,
        photo: new Blob([imageData], { type: 'image/jpeg' }),
        caption: `Here's the generated image!\nTime Taken: ${timeTaken}s`
      })
    })
  } catch (error) {
    // Update wait message with error
    return await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: message.chat.id,
        message_id: waitMessage.result.message_id,
        text: `Error: ${error.message}`
      })
    })
  }
}
