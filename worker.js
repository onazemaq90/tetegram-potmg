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
    else if (message.text === '/fix') {
      await sendrenameStartMessage(message);
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

//

async function progressForPyrogram(current, total, udType, message, start, messageId) {
  const now = Date.now();
  const diff = (now - start) / 1000; // Convert to seconds
  const apiUrl = `https://api.telegram.org/bot${botToken}`;

  // Update every 5 seconds or when complete
  if (Math.round(diff % 5) === 0 || current === total) {
    const percentage = (current * 100) / total;
    const speed = current / diff;
    const elapsedTime = Math.round(diff * 1000);
    const timeToCompletion = Math.round((total - current) / speed) * 1000;
    const estimatedTotalTime = elapsedTime + timeToCompletion;

    const elapsedTimeStr = timeFormatter(elapsedTime);
    const estimatedTotalTimeStr = timeFormatter(estimatedTotalTime);

    const progressBlocks = Math.floor(percentage / 5);
    const progress = '▣'.repeat(progressBlocks) + '▢'.repeat(20 - progressBlocks);

    const tmp = progress + `\n\n📊 Progress: ${percentage.toFixed(2)}%\n` +
      `✅ Done: ${humanBytes(current)}\n` +
      `📦 Total: ${humanBytes(total)}\n` +
      `⚡ Speed: ${humanBytes(speed)}/s\n` +
      `⏳ ETA: ${estimatedTotalTimeStr || '0s'}`;

    try {
      await fetch(`${apiUrl}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          message_id: messageId,
          text: `${udType}\n\n${tmp}`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '✖️ Cancel ✖️', callback_data: 'close' }]
            ]
          }
        })
      });
    } catch (error) {
      console.error('Error editing progress message:', error);
    }
  }
}

function humanBytes(size) {
  if (!size) return '';
  const power = 2 ** 10;
  let n = 0;
  const powerUnits = { 0: ' ', 1: 'K', 2: 'M', 3: 'G', 4: 'T' };
  
  while (size > power) {
    size /= power;
    n += 1;
  }
  return `${size.toFixed(2)} ${powerUnits[n]}B`;
}

function timeFormatter(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '0s';
}

function convert(seconds) {
  seconds = Math.floor(seconds % (24 * 3600));
  const hour = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;
  return `${hour}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

//

async function sendLog(bot, user) {
  const LOG_CHANNEL = '-1002630167697';
  const apiUrl = `https://api.telegram.org/bot${botToken}`;
  
  // Get current time in Asia/Kolkata
  const now = new Date();
  const options = { 
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  const formatter = new Intl.DateTimeFormat('en-IN', options);
  const parts = formatter.formatToParts(now);
  
  let date = '', time = '';
  for (const part of parts) {
    if (part.type === 'month') date += part.value;
    else if (part.type === 'day') date = part.value + ' ' + date;
    else if (part.type === 'year') date += ', ' + part.value;
    else if (part.type === 'hour' || part.type === 'minute' || part.type === 'second' || part.type === 'dayPeriod') {
      time += part.value;
    }
  }

  const text = `<b><u>New User Started The Bot</u></b>\n\n` +
    `<b>User Mention</b> : ${user.first_name}\n` +
    `<b>User ID</b> : <code>${user.id}</code>\n` +
    `<b>First Name</b> : ${user.first_name || 'N/A'}\n` +
    `<b>Last Name</b> : ${user.last_name || 'N/A'}\n` +
    `<b>Username</b> : @${user.username || 'N/A'}\n` +
    `<b>User Link</b> : <a href="tg://user?id=${user.id}">Click Here</a>\n\n` +
    `<b>Date</b> : ${date}\n` +
    `<b>Time</b> : ${time}`;

  await fetch(`${apiUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: LOG_CHANNEL,
      text: text,
      parse_mode: 'HTML'
    })
  });
}

function addPrefixSuffix(inputString, prefix = '', suffix = '') {
  // Cloudflare Workers don't have direct filesystem access
  // This is a simplified version for string manipulation
  const lastDotIndex = inputString.lastIndexOf('.');
  let filename, extension;
  
  if (lastDotIndex === -1) {
    filename = inputString;
    extension = '';
  } else {
    filename = inputString.substring(0, lastDotIndex);
    extension = inputString.substring(lastDotIndex);
  }
  
  if (!prefix && !suffix) {
    return `${filename}${extension}`;
  }
  
  return `${prefix || ''}${filename}${suffix ? ' ' + suffix : ''}${extension}`;
}

//

async function renameStartMessage(message) {
  const fileSize = 0; // You'll need to get this from the message
  const filename = 'file.name'; // You'll need to get this from the message
  
  if (fileSize > 2000 * 1024 * 1024) {
    return await fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: "Sorry Bro This Bot Doesn't Support Uploading Files Bigger Than 2GB",
        reply_to_message_id: message.message_id
      })
    });
  }

  try {
    await fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: `**Please Enter New Filename...**\n\n**Old File Name** :- \`${filename}\``,
        reply_to_message_id: message.message_id,
        reply_markup: {
          force_reply: true,
          selective: true
        },
        parse_mode: 'Markdown'
      })
    });
  } catch (error) {
    console.error('Error in renameStart:', error);
  }
}

async function reFunc(message) {
  const newName = message.text;
  await fetch(`${apiUrl}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: message.chat.id,
      message_id: message.message_id
    })
  });

  // Create buttons for file type selection
  const buttons = {
    inline_keyboard: [
      [{ text: '📁 Document', callback_data: 'upload_document' }]
      // Add other buttons based on file type
    ]
  };

  await fetch(`${apiUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: message.chat.id,
      text: `**Select The Output File Type**\n\n**File Name :-** \`${newName}\``,
      reply_to_message_id: message.reply_to_message.message_id,
      reply_markup: buttons,
      parse_mode: 'Markdown'
    })
  });
}

//

async function downloadFileWithProgress(fileId, chatId, userId, filename) {
  // Send initial progress message
  const progressMsg = await fetch(`${apiUrl}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '🚀 Try To Download... ⚡'
    })
  }).then(res => res.json());

  const startTime = Date.now();
  let lastUpdate = 0;
  
  // This is a simplified version - in a real implementation, you would:
  // 1. Get the file from Telegram
  // 2. Stream it to storage (like R2) while tracking progress
  // 3. Update the progress message periodically
  
  // Simulating download progress
  for (let i = 0; i <= 100; i += 5) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update progress every 2 seconds or when complete
    if (Date.now() - lastUpdate > 2000 || i === 100) {
      await progressForPyrogram(
        i * 100000, // Simulating bytes downloaded
        100 * 100000, // Simulating total file size
        '🚀 Try To Downloading... ⚡',
        { chat: { id: chatId } },
        startTime,
        progressMsg.result.message_id
      );
      lastUpdate = Date.now();
    }
  }
  
  // Return the "downloaded" file path (in a real implementation, this would be your storage path)
  return `downloads/${userId}/${filename}`;
}

async function uploadFileWithProgress(filePath, chatId, caption, type, messageId) {
  const startTime = Date.now();
  let lastUpdate = 0;
  
  // Simulating upload progress
  for (let i = 0; i <= 100; i += 5) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update progress every 2 seconds or when complete
    if (Date.now() - lastUpdate > 2000 || i === 100) {
      await progressForPyrogram(
        i * 100000, // Simulating bytes uploaded
        100 * 100000, // Simulating total file size
        '💠 Try To Uploading... ⚡',
        { chat: { id: chatId } },
        startTime,
        messageId
      );
      lastUpdate = Date.now();
    }
  }
  
  // In a real implementation, you would actually upload the file here
  // and send the appropriate message based on file type
  let method = 'sendDocument';
  if (type === 'video') method = 'sendVideo';
  else if (type === 'audio') method = 'sendAudio';
  
  await fetch(`${apiUrl}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      [type === 'document' ? 'document' : type]: filePath,
      caption: caption,
      parse_mode: 'Markdown'
    })
  });
  
  // Delete the progress message
  await fetch(`${apiUrl}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId
    })
  });
}
