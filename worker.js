addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Configuration
const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'
const FORWARD_CHANNEL_ID = '-1002336355456'
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
    return new Response('Send POST request with Telegram update', { status: 403 })
  }

  const update = await request.json()
  
  if (!update.message) {
    return new Response('Not a message', { status: 400 })
  }

  const { message } = update
  
  // Handle /ip command
  if (message.text && message.text.startsWith('/ip')) {
    return handleIpCommand(message)
  }

  return new Response('OK', { status: 200 })
}

async function handleIpCommand(message) {
  const chatId = message.chat.id
  const messageId = message.message_id
  
  // Initial message with progress bar
  const initialMessage = await sendMessage(chatId, formatProgressMessage(0))
  
  // Simulate IP checking progress
  for (let progress = 10; progress <= 100; progress += 10) {
    await sleep(500) // Add delay between updates
    await editMessage(
      chatId,
      initialMessage.result.message_id,
      formatProgressMessage(progress)
    )
  }

  // Get IP information
  const ipInfo = await fetchIpInfo()
  
  // Final message
  const finalMessage = formatIpInfoMessage(ipInfo)
  await editMessage(chatId, initialMessage.result.message_id, finalMessage)
  
  // Forward to channel
  await forwardToChannel(finalMessage)
}

function formatProgressMessage(progress) {
  const progressIndex = Math.floor(progress / 10)
  const progressBar = progressFrames[progressIndex]
  
  return `╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressBar} ${progress}%
⏳ Please wait...`
}

function formatIpInfoMessage(ipInfo) {
  return `╔═══════════════════╗
║ 🌐 𝐈𝐏 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧  ║
╚═══════════════════╝
📍 IP: ${ipInfo.ip}
🌍 Country: ${ipInfo.country}
🏢 ISP: ${ipInfo.org}
📍 City: ${ipInfo.city}
🌐 Region: ${ipInfo.region}`
}

async function sendMessage(chatId, text) {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
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
  const response = await fetch(`${TELEGRAM_API}/editMessageText`, {
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

async function forwardToChannel(text) {
  return sendMessage(FORWARD_CHANNEL_ID, text)
}

async function fetchIpInfo() {
  const response = await fetch('https://ipapi.co/json/')
  return response.json()
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
