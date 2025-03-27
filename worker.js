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
    if (parts.length < 2) {
      await sendMessage(chatId, 'Please provide a BIN. Usage: /gen 123456', botToken)
      return new Response('OK', { status: 200 })
    }

    const bin = parts[1].trim()
    if (bin.length < 6 || isNaN(bin)) {
      await sendMessage(chatId, 'Invalid BIN. BIN must be at least 6 digits.', botToken)
      return new Response('OK', { status: 200 })
    }

    // Generate cards
    const cards = generateCards(bin, 10) // Generate 10 cards
    const binInfo = await getBinInfo(bin)
    
    let response = `━━━━━━━━━━━━━━━━━━━━\n`
    response += `✅ BIN: ${bin}\n`
    response += `🏦 Bank: ${binInfo.bank || 'Unknown'}\n`
    response += `🌍 Country: ${binInfo.country || 'Unknown'}\n`
    response += `💳 Type: ${binInfo.type || 'Unknown'}\n`
    response += `━━━━━━━━━━━━━━━━━━━━\n`
    response += `🔢 Generated Cards:\n\n`
    
    cards.forEach((card, index) => {
      response += `${index+1}. ${formatCardNumber(card)}\n`
    })
    
    response += `\n━━━━━━━━━━━━━━━━━━━━\n`
    response += `ℹ️ Cards are randomly generated for testing purposes only`

    await sendMessage(chatId, response, botToken)
  } else if (message === '/start') {
    await sendMessage(chatId, 'Welcome to the BIN Generator Bot! Send /gen 123456 to generate cards with a BIN', botToken)
  }

  return new Response('OK', { status: 200 })
}

function generateCards(bin, count) {
  const cards = []
  for (let i = 0; i < count; i++) {
    let cardNumber = bin
    // Generate remaining digits (16 digits total)
    while (cardNumber.length < 15) {
      cardNumber += Math.floor(Math.random() * 10)
    }
    // Add Luhn check digit
    cardNumber += calculateLuhnCheckDigit(cardNumber)
    cards.push(cardNumber)
  }
  return cards
}

function calculateLuhnCheckDigit(partialCardNumber) {
  let sum = 0
  for (let i = 0; i < partialCardNumber.length; i++) {
    let digit = parseInt(partialCardNumber.charAt(i))
    
    if (i % 2 === 0) { // Double every other digit starting from first
      digit *= 2
      if (digit > 9) digit -= 9
    }
    
    sum += digit
  }
  return (10 - (sum % 10)) % 10
}

function formatCardNumber(cardNumber) {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
}

async function getBinInfo(bin) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${bin.substring(0, 8)}`, {
      headers: {
        'Accept-Version': '3'
      }
    })
    
    if (!response.ok) {
      return {}
    }
    
    const data = await response.json()
    return {
      bank: data.bank?.name,
      country: data.country?.name,
      type: data.type
    }
  } catch (error) {
    return {}
  }
}

async function sendMessage(chatId, text, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  }
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}
