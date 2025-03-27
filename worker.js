addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    const { pathname } = new URL(request.url)
    
    if (pathname === '/webhook') {
      const update = await request.json()
      return handleTelegramUpdate(update)
    }
  }
  
  return new Response('OK', { status: 200 })
}

async function handleTelegramUpdate(update) {
  if (!update.message || !update.message.text) {
    return new Response('OK', { status: 200 })
  }

  const message = update.message.text
  const chatId = update.message.chat.id
  const botToken = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY' // Replace with your bot token

  if (message.startsWith('/gen')) {
    const parts = message.split(' ')
    if (parts.length < 3) {
      await sendMessage(chatId, '❌ Invalid format. Use: /gen BIN AMOUNT\nExample: /gen 485199 10', botToken)
      return new Response('OK', { status: 200 })
    }

    const bin = parts[1]
    const amount = parseInt(parts[2])
    
    if (isNaN(amount) || amount <= 0 || amount > 50) {
      await sendMessage(chatId, '❌ Invalid amount. Please use between 1-50', botToken)
      return new Response('OK', { status: 200 })
    }

    if (bin.length < 4 || bin.length > 8) {
      await sendMessage(chatId, '❌ Invalid BIN. Must be 4-8 digits', botToken)
      return new Response('OK', { status: 200 })
    }

    const cards = generateCards(bin, amount)
    const responseText = `━━ • ━━━━━━━━━━━━ • ━\n` +
                        `✅ Generated ${amount} Cards\n` +
                        `💳 BIN: ${bin}\n` +
                        `━━ • ━━━━━━━━━━━━ • ━\n` +
                        `${cards.join('\n')}\n` +
                        `━━ • ━━━━━━━━━━━━ • ━\n` +
                        `ℹ️ Info: Bank - [UNKNOWN]\n` +
                        `Country - [UNKNOWN]`

    await sendMessage(chatId, responseText, botToken)
  } else if (message === '/start') {
    await sendMessage(chatId, 'Welcome to the Card Generator Bot!\n\nUse /gen BIN AMOUNT to generate cards\nExample: /gen 485199 10', botToken)
  }

  return new Response('OK', { status: 200 })
}

function generateCards(bin, amount) {
  const cards = []
  const length = 16 - bin.length
  
  for (let i = 0; i < amount; i++) {
    let cardNumber = bin
    // Generate remaining digits
    for (let j = 0; j < length - 1; j++) {
      cardNumber += Math.floor(Math.random() * 10)
    }
    // Add Luhn check digit
    cardNumber += getLuhnCheckDigit(cardNumber)
    
    // Format with spaces every 4 digits
    const formatted = cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
    cards.push(formatted)
  }
  
  return cards
}

function getLuhnCheckDigit(number) {
  let sum = 0
  let alternate = false
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i))
    
    if (alternate) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    alternate = !alternate
  }
  
  return (10 - (sum % 10)) % 10
}

async function sendMessage(chatId, text, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  }
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}
