// Environment variables (add these in Cloudflare Workers settings)
const TELEGRAM_BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4'; // Replace with your bot token
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

// Handle incoming requests
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const update = await request.json();
  const message = update.message;

  if (!message || !message.text) {
    return new Response('No message found', { status: 400 });
  }

  const chatId = message.chat.id;
  const text = message.text;

  // Handle /start command
  if (text === '/start') {
    const welcomeMessage = `Welcome to the Media Downloader Bot! 🎉\n\nI can help you download images and videos from Pinterest and TikTok. Simply use:\n/download <URL>\n\nExample:\n/download https://www.tiktok.com/@username/video/123456789\n/download https://www.pinterest.com/pin/123456789/\n\nTry it out!`;
    return sendTelegramMessage(chatId, welcomeMessage);
  }

  // Handle /download command
  if (text.startsWith('/download')) {
    const url = text.split(' ')[1];
    if (!url) {
      return sendTelegramMessage(chatId, 'Please provide a valid URL after /download');
    }

    // Send initial processing message
    const platform = url.includes('pinterest') ? 'Pinterest' : url.includes('tiktok') ? 'TikTok' : 'Unknown';
    const statusMessage = formatStatusMessage('Media', platform, 0, 'N/A', 'Processing...');
    await sendTelegramMessage(chatId, statusMessage);

    try {
      let mediaUrl;
      if (url.includes('pinterest')) {
        mediaUrl = await fetchPinterestMedia(url);
      } else if (url.includes('tiktok')) {
        mediaUrl = await fetchTikTokMedia(url);
      } else {
        return sendTelegramMessage(chatId, 'Supported platforms: Pinterest, TikTok. Provide a valid URL.');
      }

      if (mediaUrl) {
        if (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.mov')) {
          await sendTelegramVideo(chatId, mediaUrl);
        } else {
          await sendTelegramPhoto(chatId, mediaUrl);
        }
        return new Response('Media sent', { status: 200 });
      } else {
        return sendTelegramMessage(chatId, 'Could not find downloadable media in the URL');
      }
    } catch (error) {
      return sendTelegramMessage(chatId, `Error: ${error.message}`);
    }
  }

  // Default response for unrecognized commands
  return sendTelegramMessage(chatId, 'Use /start for instructions or /download <Pinterest or TikTok URL> to download media]');
}

// Format the status message with the provided template
function formatStatusMessage(file1, file2, percent, speed, time) {
  return `╭━━━━❰  Processing... ❱━➣\n┣⪼ 🗂️ : ${file1} | ${file2}\n┣⪼ ⏳️ : ${percent}%\n┣⪼ 🚀 : ${speed}/s\n┣⪼ ⏱️ : ${time}\n╰━━━━━━━━━━━━━━━➣`;
}

// Fetch media from Pinterest
async function fetchPinterestMedia(pinterestUrl) {
  const response = await fetch(pinterestUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
  });

  const html = await response.text();
  const imageMatch = html.match(/https:\/\/i\.pinimg\.com\/originals\/[a-z0-9\/]+\.(jpg|png|jpeg)/i);
  const videoMatch = html.match(/https:\/\/v\.pinimg\.com\/videos\/[a-z0-9\/]+\.mp4/i);

  if (imageMatch) return imageMatch[0];
  if (videoMatch) return videoMatch[0];
  return null;
}

// Fetch media from TikTok
async function fetchTikTokMedia(tiktokUrl) {
  const response = await fetch(tiktokUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    }
  });

  const html = await response.text();
  const videoMatch = html.match(/https:\/\/v[0-9]+\.tiktokcdn\.com\/[a-zA-Z0-9\/\-]+\.mp4/);
  
  if (videoMatch) return videoMatch[0];
  
  const redirectMatch = html.match(/<a href="(https:\/\/[a-z0-9\-\.]+tiktokcdn\.com\/[^"]+)"/);
  if (redirectMatch) {
    const redirectUrl = redirectMatch[1];
    const redirectResponse = await fetch(redirectUrl, {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (redirectResponse.ok) return redirectResponse.url;
  }

  return null;
}

// Send a text message via Telegram
async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });
  return new Response('Message sent', { status: 200 });
}

// Send a photo via Telegram
async function sendTelegramPhoto(chatId, photoUrl) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photoUrl
    })
  });
}

// Send a video via Telegram
async function sendTelegramVideo(chatId, videoUrl) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendVideo`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      video: videoUrl
    })
  });
}
