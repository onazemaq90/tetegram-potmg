addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Configuration
const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'
const FORWARD_CHANNEL_ID = '-1002336355456'
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

// Progress bar frames
const progressFrames = [
  "▱▱▱▱▱▱▱▱▱▱",
  "▰▱▱▱▱▱▱▱▱▱",
  "▰▰▱▱▱▱▱▱▱▱",
  "▰▰▰▱▱▱▱▱▱▱",
  "▰▰▰▰▱▱▱▱▱▱",
  "▰▰▰▰▰▱▱▱▱▱",
  "▰▰▰▰▰▰▱▱▱▱",
  "▰▰▰▰▰▰▰▱▱▱",
  "▰▰▰▰▰▰▰▰▱▱",
  "▰▰▰▰▰▰▰▰▰▱",
  "▰▰▰▰▰▰▰▰▰▰"
]

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Please send POST request', { status: 403 })
  }

  const payload = await request.json()
  
  // Handle /ip command
  if (payload.message && payload.message.text === '/ip') {
    const chatId = payload.message.chat.id
    const messageId = payload.message.message_id
    
    // Initial progress message
    const initialMessage = `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[0]} 0%
⏳ Please wait...`

    const response = await sendMessage(chatId, initialMessage)
    const sentMessageId = response.result.message_id

    // Simulate progress (you can replace this with actual IP checking logic)
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const progress = i * 10
      
      const updateMessage = `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[i]} ${progress}%
⏳ Please wait...`

      await editMessage(chatId, sentMessageId, updateMessage)
    }

    // Get client IP
    const clientIP = request.headers.get('CF-Connecting-IP')
    const finalMessage = `
✅ IP Scan Complete!
📍 Your IP: ${clientIP}
🌐 Location: [Determined by Cloudflare]`

    // Forward the result to channel
    await forwardToChannel(FORWARD_CHANNEL_ID, finalMessage)
    
    return new Response('OK', { status: 200 })
  }

  return new Response('OK', { status: 200 })
}

async function sendMessage(chatId, text) {
  const response = await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  })
  return await response.json()
}

async function editMessage(chatId, messageId, text) {
  const response = await fetch(`${API_URL}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: 'HTML'
    })
  })
  return await response.json()
}

async function forwardToChannel(channelId, text) {
  const response = await fetch(`${API_URL}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: channelId,
      text: text,
      parse_mode: 'HTML'
    })
  })
  return await response.json()
}
