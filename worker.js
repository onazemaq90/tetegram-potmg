const BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json()
    return handleUpdate(update)
  }
  return new Response('OK')
}

async function handleUpdate(update) {
  if (!update.message || !update.message.text) return new Response('OK')
  
  const message = update.message
  const text = message.text
  const chatId = message.chat.id

  // Handle commands
  if (text.startsWith('/start') || text.startsWith('/help')) {
    return sendWelcome(chatId)
  } else if (text.startsWith('/gen') || text.startsWith('.gen')) {
    return handleGenCommand(chatId, text)
  }

  return new Response('OK')
}

async function sendWelcome(chatId) {
  const welcomeText = `Welcome to CC Generator Bot!\\n\\nCommands:\\n/gen BIN or .gen BIN - Generate credit cards\\nExample: /gen 446542\\n\\nGenerates valid cards using Luhn algorithm`
  
  return sendTelegramMessage(chatId, welcomeText)
}

async function handleGenCommand(chatId, text) {
  const binNumber = text.split(' ')[1]
  
  if (!isValidBin(binNumber)) {
    return sendTelegramMessage(chatId, 'Invalid BIN. Provide valid 6-digit BIN.')
  }

  const binInfo = await getBinInfo(binNumber)
  const cards = generateCards(binNumber, 15)
  
  let response = `••• CC GENERATOR\\n•Format Used: ${binNumber}|xx|xx|xxx\\n\\n`
  response += cards.join('\\n')
  
  if (binInfo) {
    const binText = `\\n\\n🏦 BIN Info:\\n• Brand: ${binInfo.scheme}\\n• Type: ${binInfo.type}\\n`
    response += binText
  }

  return sendTelegramMessage(chatId, response)
}

function isValidBin(binNumber) {
  return /^\d{6}$/.test(binNumber)
}

async function getBinInfo(binNumber) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${binNumber}`, {
      headers: { 'Accept-Version': '3' }
    })
    
    if (response.ok) return response.json()
    return null
  } catch (error) {
    return null
  }
}

function generateCards(binPrefix, count) {
  const cards = []
  for (let i = 0; i < count; i++) {
    cards.push(generateCard(binPrefix) + '|' + generateCardDetails())
  }
  return cards
}

function generateCard(binPrefix, length = 16) {
  let cardNumber = binPrefix.toString()
  
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10)
  }

  const digits = cardNumber.split('').map(Number)
  let total = 0
  let isEven = false

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]
    if (isEven) digit *= 2
    total += digit > 9 ? digit - 9 : digit
    isEven = !isEven
  }

  const checkDigit = (10 - (total % 10)) % 10
  return cardNumber + checkDigit.toString()
}

function generateCardDetails() {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
  const year = new Date().getFullYear().toString().slice(2)
  const cvv = String(Math.floor(Math.random() * 900) + 100)
  return `${month}|${year}|${cvv}`
}

async function sendTelegramMessage(chatId, text) {
  const url = `${TELEGRAM_API}/sendMessage`
  
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  })
}
