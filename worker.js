addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Configuration
const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY' // Replace with your Telegram bot token
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

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
  
  if (!payload.message || !payload.message.text) {
    return new Response('No message text found', { status: 400 })
  }

  const { message } = payload
  const { chat: { id: chatId }, text } = message

  // Handle /ip command
  if (text.startsWith('/ip')) {
    const ipToCheck = text.split(' ')[1] || 'Loading...'
    return handleIpCommand(chatId, ipToCheck)
  }

  return new Response('OK', { status: 200 })
}

async function handleIpCommand(chatId, ip) {
  // Initial message
  const initialMessage = `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[0]} 0%
⏳ Please wait...`

  const msgResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: initialMessage,
    }),
  })

  const { result: { message_id } } = await msgResponse.json()

  // Simulate progress updates
  for (let i = 0; i <= 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const progress = i * 10
    const progressMessage = `
╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressFrames[i]} ${progress}%
⏳ Please wait...`

    await fetch(`${TELEGRAM_API}/editMessageText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: message_id,
        text: progressMessage,
      }),
    })
  }

  // Fetch IP information
  const ipInfo = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json())

  // Final result message
  const finalMessage = `
✅ IP Scan Complete!

📍 IP: ${ipInfo.ip}
🌍 Country: ${ipInfo.country_name}
🏢 City: ${ipInfo.city}
🌐 Region: ${ipInfo.region}
📡 ISP: ${ipInfo.org}
🗺️ Location: ${ipInfo.latitude}, ${ipInfo.longitude}
⏰ Timezone: ${ipInfo.timezone}
`

  return fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: message_id,
      text: finalMessage,
    }),
  })
}
