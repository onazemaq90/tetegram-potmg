// Cloudflare Worker Telegram Bot for IP checking with map location

const TELEGRAM_BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';
const IP_API_URL = 'http://ip-api.com/json/';

// Handle incoming requests
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    try {
      const update = await request.json();
      return handleTelegramUpdate(update);
    } catch (error) {
      return new Response('Error processing request', { status: 500 });
    }
  }
  return new Response('Method not allowed', { status: 405 });
}

async function handleTelegramUpdate(update) {
  // Check if the update contains a message with text
  if (!update.message || !update.message.text) {
    return new Response('OK');
  }

  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text.trim();

  // Handle /ip command
  if (text.startsWith('/ip')) {
    // Extract IP address from command (if provided)
    const ipAddress = text.split(' ')[1] || '';
    
    // Send "please wait" message
    await sendTelegramMessage(chatId, '⏳ Please wait while we check the IP...');
    
    // Get IP information
    const ipInfo = await getIpInfo(ipAddress);
    
    if (ipInfo.status === 'fail') {
      await sendTelegramMessage(chatId, `❌ Error: ${ipInfo.message}`);
    } else {
      // Create response with map and info
      const mapUrl = `https://maps.google.com/maps?q=${ipInfo.lat},${ipInfo.lon}&z=10`;
      const messageText = `🌍 IP Information:\n\n` +
                         `🔹 IP: ${ipInfo.query}\n` +
                         `📍 Location: ${ipInfo.city}, ${ipInfo.regionName}, ${ipInfo.country}\n` +
                         `🏢 ISP: ${ipInfo.isp}\n` +
                         `🔄 AS: ${ipInfo.as}\n\n` +
                         `🗺️ [View on Map](${mapUrl})`;
      
      await sendTelegramMessage(chatId, messageText, true);
    }
  } else if (text === '/start') {
    await sendTelegramMessage(chatId, 'Welcome to IP Checker Bot! Send /ip [address] to check an IP or just /ip to check your own.');
  }

  return new Response('OK');
}

async function getIpInfo(ipAddress = '') {
  const url = ipAddress ? `${IP_API_URL}${ipAddress}` : IP_API_URL;
  const response = await fetch(url);
  return await response.json();
}

async function sendTelegramMessage(chatId, text, markdown = false) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: markdown ? 'Markdown' : undefined,
    disable_web_page_preview: !markdown
  };

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}
