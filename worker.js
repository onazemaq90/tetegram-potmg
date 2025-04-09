const botToken = `7664037049:AAFTD25g8wQ-b_gLV18Kg-Zbv_b1gLtvyzY`
const apiUrl = `https://api.telegram.org/bot${botToken}`

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json()
    return handleUpdate(update)
  }
  return new Response('Hello from Telegram Bot Worker!', { status: 200 })
}

async function handleUpdate(update) {
  if (!update.message && !update.callback_query) {
    return new Response('OK', { status: 200 })
  }


  if (update.message) {
    const message = update.message
    if (message.text === '/start' || message.text === '/start@your_bot_username') {
      await sendStartMessage(message)
    } else if (message.text === '/donate') {
      await sendDonateMessage(message)
    }
  } else if (update.callback_query) {
    await handleCallbackQuery(update.callback_query)
  }

  return new Response('OK', { status: 200 })
}

async function sendStartMessage(message) {
  const user = message.from
  const startText = `👋 Hello ${user.first_name || ''} ${user.last_name || ''}!\n\n` +
                   `Welcome to our bot! Here you can find useful tools and features.\n\n` +
                   `Use the buttons below to navigate:`
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔊 Updates', url: 'https://t.me/Madflix_Bots' },
        { text: '♻️ Support', url: 'https://t.me/MadflixBots_Support' }
      ],
      [
        { text: '❤️‍🩹 About', callback_data: 'about' },
        { text: '🛠️ Help', callback_data: 'help' }
      ],
      [
        { text: '👨‍💻 Developer', url: 'https://t.me/CallAdminRobot' }
      ]
    ]
  }

  const payload = {
    chat_id: message.chat.id,
    text: startText,
    reply_markup: keyboard,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  }

  // If you have a START_PIC
  if (true /* replace with your condition for START_PIC */) {
    const photoPayload = {
      chat_id: message.chat.id,
      photo: 'https://t.me/kajal_developer/98',
      caption: startText,
      reply_markup: keyboard
    }
    return fetch(`${apiUrl}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(photoPayload)
    })
  } else {
    return fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
}

async function handleCallbackQuery(callbackQuery) {
  const data = callbackQuery.data
  const message = callbackQuery.message
  
  if (data === 'start') {
    const startText = `👋 Hello ${callbackQuery.from.first_name || ''} ${callbackQuery.from.last_name || ''}!\n\n` +
                     `Welcome to our bot! Here you can find useful tools and features.\n\n` +
                     `Use the buttons below to navigate:`
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '🔊 Updates', url: 'https://t.me/Madflix_Bots' },
          { text: '♻️ Support', url: 'https://t.me/MadflixBots_Support' }
        ],
        [
          { text: '❤️‍🩹 About', callback_data: 'about' },
          { text: '🛠️ Help', callback_data: 'help' }
        ],
        [
          { text: '👨‍💻 Developer', url: 'https://t.me/CallAdminRobot' }
        ]
      ]
    }
    
    await fetch(`${apiUrl}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: startText,
        reply_markup: keyboard,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })
  } 
  else if (data === 'help') {
    const helpText = `🛠️ *Help Section*\n\n` +
                     `Here are the available commands:\n\n` +
                     `/start - Start the bot\n` +
                     `/help - Show this help message\n` +
                     `/donate - Support the bot development\n\n` +
                     `For more information, please contact support.`
    
    await fetch(`${apiUrl}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: helpText,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⚡ 4GB Rename Bot', url: 'https://t.me/FileRenameXProBot' }
            ],
            [
              { text: '🔒 Close', callback_data: 'close' },
              { text: '◀️ Back', callback_data: 'start' }
            ]
          ]
        },
        parse_mode: 'Markdown'
      })
    })
  }
  else if (data === 'about') {
    const aboutText = `🤖 *About This Bot*\n\n` +
                      `This bot provides useful tools and services.\n\n` +
                      `• Version: 1.0\n` +
                      `• Developer: @CallAdminRobot\n` +
                      `• Framework: Cloudflare Workers\n\n` +
                      `For more bots, check our channel!`
    
    await fetch(`${apiUrl}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: aboutText,
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🤖 More Bots', url: 'https://t.me/Madflix_Bots/7' }
            ],
            [
              { text: '🔒 Close', callback_data: 'close' },
              { text: '◀️ Back', callback_data: 'start' }
            ]
          ]
        },
        parse_mode: 'Markdown'
      })
    })
  }
  else if (data === 'close') {
    try {
      await fetch(`${apiUrl}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          message_id: message.message_id
        })
      })
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }
  
  // Answer the callback query to remove the loading indicator
  await fetch(`${apiUrl}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQuery.id
    })
  })
}

async function sendDonateMessage(message) {
  const donateText = `💖 *Donation Information*\n\n` +
                    `If you find this bot useful, consider supporting the developer.\n\n` +
                    `Your donations help keep the bot running and improve its features.`
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🦋 Admin', url: 'https://t.me/CallAdminRobot' },
        { text: '✖️ Close', callback_data: 'close' }
      ]
    ]
  }
  
  await fetch(`${apiUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: donateText,
      reply_markup: keyboard,
      parse_mode: 'Markdown'
    })
  })
}
