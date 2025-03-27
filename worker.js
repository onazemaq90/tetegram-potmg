const TELEGRAM_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';
const IP_API_URL = 'http://ip-api.com/json/';

async function handleRequest(request) {
  if (request.method === 'POST') {
    try {
      const update = await request.json();
      if (update.message) {
        await processMessage(update.message);
      }
      return new Response('OK');
    } catch (error) {
      return new Response('Error processing request', { status: 500 });
    }
  }
  return new Response('Method not allowed', { status: 405 });
}

async function processMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  
  if (text.startsWith('/ip')) {
    const ip = text.split(' ')[1] || message.from.id; // Default to user ID if no IP provided
    
    // Send initial loading message
    const loadingMessage = await sendTelegramMessage(chatId, `⏳ *Checking IP...* \n\n▰▱▱▱▱▱▱▱▱▱ 10%`, true);
    
    try {
      // Simulate progress updates
      await updateProgress(chatId, loadingMessage.result.message_id, 30);
      
      // Get IP info
      const ipInfo = await getIPInfo(ip);
      await updateProgress(chatId, loadingMessage.result.message_id, 70);
      
      // Format response
      const responseText = formatIPInfo(ipInfo);
      const mapUrl = `https://maps.google.com/maps?q=${ipInfo.lat},${ipInfo.lon}&z=10`;
      
      await updateProgress(chatId, loadingMessage.result.message_id, 90);
      
      // Edit message with final result
      await editTelegramMessage(chatId, loadingMessage.result.message_id, responseText, true);
      
      // Send location map
      await sendTelegramMessage(chatId, `📍 [View on Map](${mapUrl})`, true);
      
    } catch (error) {
      await editTelegramMessage(chatId, loadingMessage.result.message_id, `❌ Error checking IP: ${error.message}`, true);
    }
  } else if (text === '/start') {
    await sendTelegramMessage(chatId, 'Welcome to IP Checker Bot! Send /ip [address] to check an IP', true);
  }
}

async function updateProgress(chatId, messageId, percent) {
  const progressBar = generateProgressBar(percent);
  await editTelegramMessage(chatId, messageId, `⏳ *Checking IP...* \n\n${progressBar} ${percent}%`, true);
  // Simulate delay for progress effect
  await new Promise(resolve => setTimeout(resolve, 500));
}

function generateProgressBar(percent) {
  const filled = '▰';
  const empty = '▱';
  const total = 10;
  const filledCount = Math.round(percent / 10);
  return filled.repeat(filledCount) + empty.repeat(total - filledCount);
}

async function getIPInfo(ip) {
  const response = await fetch(`${IP_API_URL}${ip}`);
  if (!response.ok) {
    throw new Error('Failed to fetch IP info');
  }
  return await response.json();
}

function formatIPInfo(ipInfo) {
  if (ipInfo.status !== 'success') {
    return `❌ Failed to get info for this IP: ${ipInfo.message || 'Unknown error'}`;
  }
  
  return `🔍 *IP Information*:
  
🆔 *IP Address*: \`${ipInfo.query}\`
🏙️ *City*: ${ipInfo.city}
🏛️ *Region*: ${ipInfo.regionName}
🌎 *Country*: ${ipInfo.country} (${ipInfo.countryCode})
📍 *Location*: ${ipInfo.lat}, ${ipInfo.lon}
🏢 *ISP*: ${ipInfo.isp}
🖥️ *AS*: ${ipInfo.as}
📡 *Organization*: ${ipInfo.org}`;
}

async function sendTelegramMessage(chatId, text, markdown = false) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: markdown ? 'Markdown' : undefined
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return await response.json();
}

async function editTelegramMessage(chatId, messageId, text, markdown = false) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: markdown ? 'Markdown' : undefined
  };
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return await response.json();
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
