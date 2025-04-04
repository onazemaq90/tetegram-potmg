addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const BOT_TOKEN = '7150790470:AAG1_GlWrq3SQSD0e5R8dTx487jBydO7IBI';
const MAX_VIDEO_SIZE = 50; // MB
const MAX_TELEGRAM_SIZE = 50; // Telegram's file size limit is 50MB for bots
const teraboxUrlRegex = /^https?:\/\/(?:www\.)?(?:[\w-]+\.)?(terabox\.com|1024terabox\.com|teraboxapp\.com|terafileshare\.com|teraboxlink\.com|terasharelink\.com)\/(s|sharing)\/[\w-]+/i;

async function handleRequest(request) {
  const url = new URL(request.url);
  
  if (request.method === 'GET' && url.pathname === '/') {
    return new Response('🤖 Bot is running on Cloudflare Workers!');
  }
  
  if (request.method === 'POST' && url.pathname === '/webhook') {
    const update = await request.json();
    return handleUpdate(update);
  }
  
  return new Response('Not found', { status: 404 });
}

async function handleUpdate(update) {
  const chatId = update.message?.chat.id;
  if (!chatId) return new Response('OK');
  
  // Handle /start command
  if (update.message?.text === '/start') {
    const photoUrl = 'https://graph.org/file/4e8a1172e8ba4b7a0bdfa.jpg';
    const caption = '👋 Welcome to TeraBox Downloader Bot!\n\nSend me a TeraBox sharing link to download files.';
    
    const keyboard = {
      inline_keyboard: [
        [{ text: '📌 Join Channel', url: 'https://t.me/Opleech_WD' }]
      ]
    };
    
    await sendPhoto(chatId, photoUrl, caption, keyboard);
    return new Response('OK');
  }
  
  // Handle TeraBox links
  if (update.message?.text && teraboxUrlRegex.test(update.message.text.trim())) {
    const text = update.message.text.trim();
    let processingMsg;
    
    try {
      processingMsg = await sendMessage(chatId, '⏳ Processing link...');
      const apiUrl = `https://wdzone-terabox-api.vercel.app/api?url=${encodeURIComponent(text)}`;
      
      const response = await fetch(apiUrl, { timeout: 120000 });
      const data = await response.json();
      
      const fileInfo = data?.['📜 Extracted Info']?.[0];
      if (!data?.['✅ Status'] || !fileInfo) {
        await deleteMessage(chatId, processingMsg.result.message_id);
        await sendMessage(chatId, '❌ No downloadable file found.');
        return new Response('OK');
      }
      
      const downloadLink = fileInfo['🔽 Direct Download Link'];
      let filename = (fileInfo['📂 Title'] || `file_${Date.now()}`).replace(/[^\w\s.-]/gi, '');
      if (!filename.endsWith('.mp4')) filename += '.mp4';
      const fileSizeText = fileInfo['📏 Size'] || 'N/A';
      const sizeMB = parseFloat(fileSizeText.replace('MB', '').trim()) || 0;
      
      await deleteMessage(chatId, processingMsg.result.message_id);
      
      // Check if file is an MP4 and within size limits
      if (filename.endsWith('.mp4')) {
        if (sizeMB <= MAX_TELEGRAM_SIZE) {
          // Send video directly through Telegram
          const sentMessage = await sendVideo(chatId, downloadLink, filename, fileSizeText);
          
          if (!sentMessage.ok) {
            // Fallback to sending download link if video send fails
            await sendDownloadLink(chatId, filename, fileSizeText, downloadLink);
          }
        } else {
          // File too large - send download link
          await sendDownloadLink(chatId, filename, fileSizeText, downloadLink);
        }
      } else {
        // Not an MP4 - send download link
        await sendDownloadLink(chatId, filename, fileSizeText, downloadLink);
      }
      
    } catch (err) {
      console.error('Error:', err);
      try {
        if (processingMsg?.result?.message_id) {
          await deleteMessage(chatId, processingMsg.result.message_id);
        }
      } catch (e) {}
      await sendMessage(chatId, '❌ Failed to process the link. Please try again later.');
    }
  }
  
  return new Response('OK');
}

// Send video directly through Telegram
async function sendVideo(chatId, videoUrl, filename, fileSizeText) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`;
  const body = {
    chat_id: chatId,
    video: videoUrl,
    caption: `🎥 ${filename}\n📏 ${fileSizeText}`,
    supports_streaming: true,
    parse_mode: 'HTML'
  };
  
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json());
}

// Send download link as fallback
async function sendDownloadLink(chatId, filename, fileSizeText, downloadLink) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🔗 Download Now', url: downloadLink }]
    ]
  };
  
  if (parseFloat(fileSizeText.replace('MB', '')) > MAX_VIDEO_SIZE) {
    await sendMessage(
      chatId,
      `⚠️ File too large to send!\n\n📁 ${filename}\n📏 ${fileSizeText}`,
      keyboard
    );
  } else {
    await sendMessage(
      chatId,
      `✅ Here's your download link:\n\n📁 ${filename}\n📏 ${fileSizeText}`,
      keyboard
    );
  }
}

// Existing helper functions
async function sendMessage(chatId, text, replyMarkup) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup
  };
  
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json());
}

async function sendPhoto(chatId, photoUrl, caption, replyMarkup) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  const body = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    reply_markup: replyMarkup
  };
  
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json());
}

async function deleteMessage(chatId, messageId) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`;
  const body = {
    chat_id: chatId,
    message_id: messageId
  };
  
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json());
}
