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

  // Handle /gen command
  if (message.startsWith('/gen')) {
    const parts = message.split(' ')
    if (parts.length < 4 || !parts[1].startsWith('$') || isNaN(parts[3])) {
      await sendMessage(chatId, 'Invalid format. Use: /gen $bin amount 10', botToken)
      return new Response('OK', { status: 200 })
    }

    const bin = parts[1].substring(1) // Remove $ prefix
    const count = parseInt(parts[3])
    const cards = generateCards(bin, count)

    const responseText = `
━ • ━━━━━━━━━━━━ • ━
 [ ᛋᛋ ]  Generator [ ᛋᛋ ]

From: ${bin}|rnd|rnd|rnd
━ • ━━━━━━━━━━━━ • ━
${cards.join('\n')}

━ • ━━━━━━━━━━━━ • ━
owner by @sumit_exe
━ • ━━━━━━━━━━━━ • ━
    `

    await sendMessage(chatId, responseText, botToken)
  }

  return new Response('OK', { status: 200 })
}

function generateCards(bin, count) {
  const cards = []
  
  for (let i = 0; i < count; i++) {
    let cardNumber = bin
    
    // Fill remaining digits (up to 16) with random numbers
    while (cardNumber.length < 16) {
      cardNumber += Math.floor(Math.random() * 10)
    }
    
    // Generate random expiry (MM/YY) and CVV
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const year = String(new Date().getFullYear() % 100 + Math.floor(Math.random() * 5) + 1).padStart(2, '0')
    const cvv = String(Math.floor(Math.random() * 900) + 100)
    
    cards.push(`${cardNumber}|${month}|${year}|${cvv}`)
  }
  
  return cards
}

async function sendMessage(chatId, text, botToken) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  
  const response = await fetch(url, {
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
