addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Configuration - Replace with your values
const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'
const FORWARD_CHANNEL_ID = '-1002336355456' // Channel where to forward messages
const API_ENDPOINT = 'https://ip-api.com/json/' // Free IP lookup API

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
  
  // Handle only messages with /ip command
  if (!payload.message?.text?.startsWith('/ip')) {
    return new Response('OK', { status: 200 })
  }

  const chatId = payload.message.chat.id
  const ipToCheck = payload.message.text.split(' ')[1] || ''

  // Send initial message with progress bar
  const initialMessage = await sendTelegramMessage(chatId, formatProgressMessage(0))
  const messageId = initialMessage.result.message_id

  // Simulate progress and update message
  for (let progress = 10; progress <= 100; progress += 10) {
    await new Promise(resolve => setTimeout(resolve, 500))
    await updateTelegramMessage(chatId, messageId, formatProgressMessage(progress))
  }

  // Get actual IP info
  const ipInfo = await fetchIpInfo(ipToCheck)
  const resultMessage = formatIpInfo(ipInfo)
  
  // Update final message
  await updateTelegramMessage(chatId, messageId, resultMessage)
  
  // Forward to channel if configured
  if (FORWARD_CHANNEL_ID) {
    await forwardToChannel(FORWARD_CHANNEL_ID, resultMessage)
  }

  return new Response('OK', { status: 200 })
}

function formatProgressMessage(progress) {
  const frameIndex = Math.floor((progress / 100) * (progressFrames.length - 1))
  return `╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[frameIndex]} ${progress}%
⏳ Please wait...`
}

async function fetchIpInfo(ip) {
  const response = await fetch(`${API_ENDPOINT}${ip}`)
  return await response.json()
}

function formatIpInfo(info) {
  return `📊 IP Information Results:
━━━━━━━━━━━━━━━
🌐 IP: ${info.query}
📍 Location: ${info.city}, ${info.country}
🏢 ISP: ${info.isp}
🌍 Region: ${info.regionName}
⏰ Timezone: ${info.timezone}
━━━━━━━━━━━━━━━`
}

async function sendTelegramMessage(chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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

async function updateTelegramMessage(chatId, messageId, text) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
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
  return await sendTelegramMessage(channelId, text)
}
