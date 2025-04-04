// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const BOT_TOKEN = '7150790470:AAG1_GlWrq3SQSD0e5R8dTx487jBydO7IBI';
const MAX_VIDEO_SIZE = 50;
const teraboxUrlRegex = /^https?:\/\/(?:www\.)?(?:[\w-]+\.)?(terabox\.com|1024terabox\.com|teraboxapp\.com|terafileshare\.com|teraboxlink\.com|terasharelink\.com)\/(s|sharing)\/[\w-]+/i;

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle webhook verification
  if (request.method === 'GET' && url.pathname === '/') {
    return new Response('🤖 Bot is running on Cloudflare Workers!');
  }
  
  // Handle Telegram webhook
  if (request.method === 'POST' && url.pathname === '/webhook') {
    const update = await request.json();
    return handleUpdate(update);
  }
  
  return new Response('Not found', { status: 404 });
}

async function handleUpdate(update) {
  // Initialize session (simplified for Workers)
  const chatId = update.message?.chat.id || update.callback_query?.message.chat.id;
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
    
    // Check for duplicate links (simplified session handling)
    // Note: For proper session handling, you'd need to use Workers KV
    // const lastLink = await getSession(chatId);
    // if (lastLink === text) {
    //   await sendMessage(chatId, '⚠️ You already sent this link. Please wait...');
    //   return new Response('OK');
    // }
    // await setSession(chatId, text);
    
    try {
      const processingMsg = await sendMessage(chatId, '⏳ Processing link...');
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
      
      const keyboard = {
        inline_keyboard: [
          [{ text: '🔗 Download Now', url: downloadLink }]
        ]
      };
      
      if (sizeMB > MAX_VIDEO_SIZE) {
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
    } catch (err) {
      console.error('Error:', err);
      await sendMessage(chatId, '❌ Failed to process the link. Please try again later.');
    }
  }
  
  return new Response('OK');
}

// Telegram API helpers
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
