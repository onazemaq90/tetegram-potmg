const BOT_TOKEN = '7150790470:AAG1_GlWrq3SQSD0e5R8dTx487jBydO7IBI'; // Replace with env var in production
const MAX_VIDEO_SIZE = 50;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const teraboxUrlRegex = /^https?:\/\/(?:www\.)?(?:[\w-]+\.)?(terabox\.com|1024terabox\.com|teraboxapp\.com|terafileshare\.com|teraboxlink\.com|terasharelink\.com)\/(s|sharing)\/[\w-]+/i;

// Utility to send/edit Telegram messages
async function sendMessage(chatId, text, extra = {}) {
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

async function editMessage(chatId, messageId, text, extra = {}) {
  const response = await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      ...extra,
    }),
  });
  return response.json();
}

async function deleteMessage(chatId, messageId) {
  await fetch(`${TELEGRAM_API}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
    }),
  });
}

async function sendVideo(chatId, videoUrl, caption) {
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

// Handle incoming webhook requests
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
    await sendMessage(chatId, '👋 Welcome to TeraBox Downloader Bot!\n\nSend me a TeraBox sharing link to download files.', {
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
    // Send initial processing message
    const processing = await sendMessage(chatId, '⏳ Processing link...');
    const processingMessageId = processing.result.message_id;

    // Fetch file info from the API
    const apiUrl = `https://wdzone-terabox-api.vercel.app/api?url=${encodeURIComponent(text)}`;
    const apiResponse = await fetch(apiUrl, { timeout: 120000 });
    const data = await apiResponse.json();

    const fileInfo = data?.['📜 Extracted Info']?.[0];
    if (!data?.['✅ Status'] || !fileInfo) {
      await deleteMessage(chatId, processingMessageId);
      await sendMessage(chatId, '❌ No downloadable file found.');
      return new Response('OK', { status: 200 });
    }

    const downloadLink = fileInfo['🔽 Direct Download Link'];
    let filename = (fileInfo['📂 Title'] || `file_${Date.now()}`).replace(/[^\w\s.-]/gi, '');
    if (!filename.endsWith('.mp4')) filename += '.mp4';
    const fileSizeText = fileInfo['📏 Size'] || 'N/A';
    const sizeMB = parseFloat(fileSizeText.replace('MB', '').trim()) || 0;

    await deleteMessage(chatId, processingMessageId);

    if (sizeMB > MAX_VIDEO_SIZE) {
      await sendMessage(chatId, `⚠️ File too large to send!\n\n📁 ${filename}\n📏 ${fileSizeText}`, {
        reply_markup: {
          inline_keyboard: [[{ text: '🔗 Download Link', url: downloadLink }]],
        },
      });
      return new Response('OK', { status: 200 });
    }

    // Start download with progress updates
    const progressMessage = await sendMessage(chatId, '🚀 Starting download (0%)...');
    const progressMessageId = progressMessage.result.message_id;

    const videoResponse = await fetch(downloadLink);
    const totalSize = parseInt(videoResponse.headers.get('content-length') || '0', 10);
    let downloadedSize = 0;

    const reader = videoResponse.body.getReader();
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      downloadedSize += value.length;
      chunks.push(value);

      const percentage = totalSize ? Math.floor((downloadedSize / totalSize) * 100) : 0;
      const downloadedMB = (downloadedSize / 1024 / 1024).toFixed(2);
      const totalMB = (totalSize / 1024 / 1024).toFixed(2);

      await editMessage(chatId, progressMessageId, `⬇️ Downloading (${percentage}%)\n${downloadedMB}MB / ${totalMB}MB`);
    }

    // Combine chunks into a single Blob
    const videoBlob = new Blob(chunks, { type: 'video/mp4' });

    // Update to "Download Complete"
    await editMessage(chatId, progressMessageId, '✅ Download Complete! Preparing upload...');

    // Send the video (Note: This won't work for large files due to Workers' limits)
    await sendVideo(chatId, downloadLink, `📁 ${filename}\n📏 ${fileSizeText}`);

    // Final message
    await deleteMessage(chatId, progressMessageId);
    await sendMessage(chatId, `✅ Video sent!\n\n📁 ${filename}\n📏 ${fileSizeText}`);

  } catch (err) {
    console.error('Error:', err);
    await deleteMessage(chatId, processingMessageId).catch(() => {});
    await sendMessage(chatId, '❌ Failed to process the link. Please try again later.');
  }

  return new Response('OK', { status: 200 });
}
