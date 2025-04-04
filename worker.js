const BOT_TOKEN = '7150790470:AAG1_GlWrq3SQSD0e5R8dTx487jBydO7IBI'; // Use env.BOT_TOKEN in production
const MAX_VIDEO_SIZE = 50;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const teraboxUrlRegex = /^https?:\/\/(?:www\.)?(?:[\w-]+\.)?(terabox\.com|1024terabox\.com|teraboxapp\.com|terafileshare\.com|teraboxlink\.com|terasharelink\.com)\/(s|sharing)\/[\w-]+/i;

// Utility to send Telegram messages
async function sendTelegramMessage(chatId, text, extra = {}) {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...extra,
    }),
  });
  return response.json();
}

// Utility to edit Telegram messages
async function editTelegramMessage(chatId, messageId, text) {
  const response = await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
    }),
  });
  return response.json();
}

// Utility to delete Telegram messages
async function deleteTelegramMessage(chatId, messageId) {
  await fetch(`${TELEGRAM_API}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
    }),
  });
}

// Utility to send video
async function sendTelegramVideo(chatId, videoUrl, caption) {
  const response = await fetch(`${TELEGRAM_API}/sendVideo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      video: videoUrl,
      caption,
    }),
  });
  return response.json();
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const update = await request.json();
  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim();
  const messageId = update.message?.message_id;

  if (!chatId || !text) {
    return new Response('OK', { status: 200 });
  }

  if (text === '/start') {
    await sendTelegramMessage(chatId, '👋 Welcome to TeraBox Downloader Bot!\n\nSend me a TeraBox sharing link to download files.', {
      reply_markup: {
        inline_keyboard: [[{ text: '📌 Join Channel', url: 'https://t.me/Opleech_WD' }]],
      },
    });
    return new Response('OK', { status: 200 });
  }

  if (!teraboxUrlRegex.test(text)) {
    return new Response('OK', { status: 200 });
  }

  try {
    const processing = await sendTelegramMessage(chatId, '⏳ Processing link...');
    const processingMessageId = processing.result.message_id;

    const apiUrl = `https://wdzone-terabox-api.vercel.app/api?url=${encodeURIComponent(text)}`;
    const apiResponse = await fetch(apiUrl, { timeout: 120000 });
    const data = await apiResponse.json();

    const fileInfo = data?.['📜 Extracted Info']?.[0];
    if (!data?.['✅ Status'] || !fileInfo) {
      await deleteTelegramMessage(chatId, processingMessageId);
      await sendTelegramMessage(chatId, '❌ No downloadable file found.');
      return new Response('OK', { status: 200 });
    }

    const downloadLink = fileInfo['🔽 Direct Download Link'];
    let filename = (fileInfo['📂 Title'] || `file_${Date.now()}`).replace(/[^\w\s.-]/gi, '');
    if (!filename.endsWith('.mp4')) filename += '.mp4';
    const fileSizeText = fileInfo['📏 Size'] || 'N/A';
    const sizeMB = parseFloat(fileSizeText.replace('MB', '').trim()) || 0;

    await deleteTelegramMessage(chatId, processingMessageId);

    if (sizeMB > MAX_VIDEO_SIZE) {
      await sendTelegramMessage(chatId, `⚠️ File too large to send!\n\n📁 ${filename}\n📏 ${fileSizeText}`, {
        reply_markup: {
          inline_keyboard: [[{ text: '🔗 Download Link', url: downloadLink }]],
        },
      });
      return new Response('OK', { status: 200 });
    }

    // Start download simulation
    const downloadStart = await sendTelegramMessage(chatId, '🚀 Starting download (0%)...');
    const downloadMessageId = downloadStart.result.message_id;

    // Simulate progress (since we can't stream, we'll fake it with time-based updates)
    for (let percent = 10; percent <= 90; percent += 10) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      await editTelegramMessage(chatId, downloadMessageId, `⬇️ Downloading (${percent}%) ${Math.round(sizeMB * (percent / 100))}MB/${sizeMB}MB`);
    }

    // Fetch the video
    const videoResponse = await fetch(downloadLink);
    const videoBlob = await videoResponse.blob();

    // Final progress update
    await editTelegramMessage(chatId, downloadMessageId, `⬇️ Downloading (100%) ${sizeMB}MB/${sizeMB}MB`);

    // Send the video (Note: This won't work directly with blob in Workers; use a URL or external service)
    await sendTelegramVideo(chatId, downloadLink, `✅ Video downloaded!\n\n📁 ${filename}\n📏 ${fileSizeText}`);
    await deleteTelegramMessage(chatId, downloadMessageId);

  } catch (err) {
    console.error('Error:', err);
    await deleteTelegramMessage(chatId, processingMessageId).catch(() => {});
    await sendTelegramMessage(chatId, '❌ Failed to process the link or download the video. Please try again later.');
  }

  return new Response('OK', { status: 200 });
}
