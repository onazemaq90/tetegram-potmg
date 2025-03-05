// Cloudflare Worker script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = '7506131429:AAE8AqZ8uAMIj8La9kluJLQUeGvVJaQIlzM'; // Replace with your Telegram Bot Token

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/webhook') {
    const update = await request.json();
    await handleTelegramUpdate(update);
    return new Response('OK', { status: 200 });
  }
  return new Response('Not Found', { status: 404 });
}

async function handleTelegramUpdate(update) {
  const chatId = update.message.chat.id;
  const text = update.message.text;

  if (text === '/start') {
    await sendMessage(chatId, 'Welcome! Send a video URL to download or use /url to process a link.');
    return;
  }

  if (text === '/url' || text.startsWith('http')) {
    const videoUrl = text.startsWith('http') ? text : null;
    if (!videoUrl) {
      await sendMessage(chatId, 'Please send a valid URL after /url command or as a separate message.');
      return;
    }

    await processVideoUrl(chatId, videoUrl);
  }
}

async function processVideoUrl(chatId, videoUrl) {
  try {
    // Encode the URL
    const encodedUrl = encodeURIComponent(videoUrl);
    const processUrl = `https://9xbuddy.in/process?url=${encodedUrl}`;

    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };

    const response = await fetch(processUrl, { headers });
    
    if (response.ok) {
      const html = await response.text();
      const links = await extractDownloadLinks(html);
      await sendDownloadOptions(chatId, links);
    } else {
      await sendMessage(chatId, `Failed to process URL: ${response.status}`);
    }
  } catch (error) {
    await sendMessage(chatId, `Error: ${error.message}`);
  }
}

async function extractDownloadLinks(html) {
  // This is a simplified version - in reality, you'd need to parse the actual 9xbuddy response structure
  const links = [];
  
  // Example link extraction (adjust based on actual 9xbuddy response)
  const regex = /href="(https?:\/\/[^"]*download[^"]*)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    links.push({
      url: match[1],
      quality: extractQuality(match[1]),
      size: extractSize(match[1]),
      type: extractType(match[1])
    });
  }
  return links;
}

function extractQuality(url) {
  if (url.includes('144p')) return '144p';
  if (url.includes('240p')) return '240p';
  if (url.includes('480p')) return '480p';
  if (url.includes('720p')) return '720p';
  return 'Unknown';
}

function extractSize(url) {
  // Placeholder - implement actual size extraction if available in response
  return '(Size Unknown)';
}

function extractType(url) {
  if (url.includes('mp3')) return 'mp3';
  if (url.includes('gif')) return 'gif';
  if (url.includes('mp4')) return 'mp4';
  return 'unknown';
}

async function sendDownloadOptions(chatId, links) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: 'mp3 Audio', callback_data: 'mp3' },
        { text: 'Extract GIF', callback_data: 'gif' }
      ]
    ]
  };

  // Add video quality options
  const qualities = ['144p', '240p', '480p', '720p'];
  qualities.forEach(quality => {
    const availableLinks = links.filter(link => link.quality === quality);
    if (availableLinks.length > 0) {
      const buttons = availableLinks.map((link, index) => ({
        text: `mp4 ${quality}${index > 0 ? ` backup${index > 1 ? ` /${index}` : ''}` : ''} ${link.size}`,
        url: link.url
      }));
      keyboard.inline_keyboard.push(buttons);
    }
  });

  await sendMessage(chatId, 'Choose download option:', {
    reply_markup: JSON.stringify(keyboard)
  });
}

async function sendMessage(chatId, text, options = {}) {
  const url = `${TELEGRAM_API}${BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    ...options
  };

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// Set up webhook (run this once)
async function setWebhook() {
  const workerUrl = 'https://tetegram-potmg.bjplover94.workers.dev';
  const url = `${TELEGRAM_API}${BOT_TOKEN}/setWebhook?url=${workerUrl}/webhook`;
  const response = await fetch(url);
  console.log(await response.json());
}
