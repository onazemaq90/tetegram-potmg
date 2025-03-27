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
  const message = update.message || update.callback_query?.message
  if (!message) return new Response('OK')
  
  const chatId = message.chat.id
  const text = message.text || ''
  const botToken = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY' // Replace with your bot token
  
  if (text.startsWith('/start')) {
    await sendMessage(botToken, chatId, `Welcome to the Card Generator Bot!\n\nUse /gen [BIN] [amount] to generate cards.\nExample: /gen 414110 10`)
  } 
  else if (text.startsWith('/gen')) {
    const parts = text.split(' ')
    if (parts.length < 3) {
      await sendMessage(botToken, chatId, 'Invalid format. Use /gen [BIN] [amount]\nExample: /gen 414110 10')
      return new Response('OK')
    }
    
    const bin = parts[1]
    const amount = parseInt(parts[2])
    
    if (isNaN(amount) {
      await sendMessage(botToken, chatId, 'Amount must be a number')
      return new Response('OK')
    }
    
    if (amount > 50) {
      await sendMessage(botToken, chatId, 'Maximum amount is 50')
      return new Response('OK')
    }
    
    const cards = generateCards(bin, amount)
    
    let responseText = `━ • ━━━━━━━━━━━━ • ━\n[ ᛋᛋ ]  Generator [ ᛋᛋ ]\n\n`
    responseText += `From: ${bin}|rnd|rnd|rnd\n`
    responseText += `━ • ━━━━━━━━━━━━ • ━\n`
    responseText += cards.join('\n') + '\n'
    responseText += `━ • ━━━━━━━━━━━━ • ━\n`
    responseText += `owner by @sumit_exe\n`
    responseText += `━ • ━━━━━━━━━━━━ • ━`
    
    await sendMessage(botToken, chatId, responseText)
  }
  
  return new Response('OK')
}

function generateCards(bin, amount) {
  const cards = []
  
  for (let i = 0; i < amount; i++) {
    // Generate remaining digits (16 digits total)
    const remainingLength = 16 - bin.length
    let cardNumber = bin
    
    for (let j = 0; j < remainingLength; j++) {
      cardNumber += Math.floor(Math.random() * 10)
    }
    
    // Generate expiry (MM/YY)
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const year = String(Math.floor(Math.random() * 5) + 23) // 2023-2027
    
    // Generate CVV (3 digits)
    const cvv = String(Math.floor(Math.random() * 900) + 100)
    
    cards.push(`${cardNumber}|${month}|${year}|${cvv}`)
  }
  
  return cards
}

async function sendMessage(botToken, chatId, text) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  
  await fetch(url, {
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
