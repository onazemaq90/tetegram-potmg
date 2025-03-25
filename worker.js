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
    return new Response('Only POST requests are accepted', { status: 405 })
  }

  const payload = await request.json()
  
  // Handle /ip command
  if (payload.message && payload.message.text === '/ip') {
    const chatId = payload.message.chat.id
    const messageId = payload.message.message_id
    
    // Send initial message
    const initialMessage = await sendMessage(chatId, `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[0]} 0%
⏳ Please wait...`)

    // Simulate progress
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      await editMessage(chatId, initialMessage.result.message_id, `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[i]} ${i*10}%
⏳ Please wait...`)
    }

    // Get IP information
    const userIP = request.headers.get('cf-connecting-ip')
    const ipInfo = await getIPInfo(userIP)

    // Final message with IP details
    const finalMessage = `
✅ 𝗦𝗰𝗮𝗻 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!

📍 IP: ${userIP}
🌍 Country: ${ipInfo.country}
🏢 ISP: ${ipInfo.isp}
🌐 Region: ${ipInfo.region}
🏙️ City: ${ipInfo.city}

⚡️ Powered by Cloudflare Workers`

    // Send final message
    await editMessage(chatId, initialMessage.result.message_id, finalMessage)

    // Forward to channel if configured
    if (FORWARD_CHANNEL_ID) {
      await forwardMessage(FORWARD_CHANNEL_ID, chatId, initialMessage.result.message_id)
    }
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
  return response.json()
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
  return response.json()
}

async function forwardMessage(toChatId, fromChatId, messageId) {
  const response = await fetch(`${API_URL}/forwardMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: toChatId,
      from_chat_id: fromChatId,
      message_id: messageId
    })
  })
  return response.json()
}

async function getIPInfo(ip) {
  // You can integrate with an IP information API here
  // This is a simplified example
  return {
    country: 'Unknown',
    isp: 'Unknown',
    region: 'Unknown',
    city: 'Unknown'
  }
}
