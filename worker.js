addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Configuration - Replace with your values
const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'
const FORWARD_CHANNEL_ID = '-1002336355456'
const WEBHOOK_PATH = '/webhook'

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
  if (request.method === 'POST') {
    const url = new URL(request.url)
    if (url.pathname === WEBHOOK_PATH) {
      const update = await request.json()
      
      if (update.message && update.message.text === '/ip') {
        const chatId = update.message.chat.id
        const messageId = await sendInitialMessage(chatId)
        
        // Simulate IP scanning process
        for (let i = 0; i <= 100; i += 10) {
          const progressFrame = progressFrames[Math.floor(i / 10)]
          await updateProgressMessage(chatId, messageId, i, progressFrame)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        // Get actual IP info
        const ipInfo = await getIpInfo(request.headers.get('cf-connecting-ip'))
        
        // Send final result
        const finalMessage = formatIpInfo(ipInfo)
        await sendTelegramMessage(chatId, finalMessage)
        
        // Forward to channel
        await forwardToChannel(finalMessage)
      }
    }
  }
  
  return new Response('OK')
}

async function sendInitialMessage(chatId) {
  const message = `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[0]} 0%
⏳ Please wait...`

  const response = await sendTelegramMessage(chatId, message)
  const result = await response.json()
  return result.result.message_id
}

async function updateProgressMessage(chatId, messageId, progress, progressFrame) {
  const message = `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrame} ${progress}%
⏳ Please wait...`

  await editTelegramMessage(chatId, messageId, message)
}

async function getIpInfo(ip) {
  const response = await fetch(`https://ipapi.co/${ip}/json/`)
  return response.json()
}

function formatIpInfo(ipInfo) {
  return `
📊 IP Information Report
━━━━━━━━━━━━━━━━━━━━
🌐 IP: ${ipInfo.ip}
📍 Location: ${ipInfo.city}, ${ipInfo.country_name}
🌍 Region: ${ipInfo.region}
🏢 ISP: ${ipInfo.org}
🌐 Timezone: ${ipInfo.timezone}
📡 Coordinates: ${ipInfo.latitude}, ${ipInfo.longitude}
`
}

async function sendTelegramMessage(chatId, text) {
  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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
}

async function editTelegramMessage(chatId, messageId, text) {
  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
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
}

async function forwardToChannel(message) {
  return sendTelegramMessage(FORWARD_CHANNEL_ID, message)
}
