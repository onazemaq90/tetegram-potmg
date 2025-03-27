// Telegram bot token from @BotFather
const TELEGRAM_BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';

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
  // Check if the update contains a message with location
  if (update.message && update.message.location) {
    const chatId = update.message.chat.id;
    const location = update.message.location;
    
    // Get approximate IP from coordinates (reverse geocoding)
    // Note: This is an approximation - actual IP would require user to send it
    const ipInfo = await getIPGeolocation(`${location.longitude},${location.latitude}`);
    
    // Format the response
    let responseText = `📍 Location Information:\n`;
    responseText += `Latitude: ${location.latitude}\n`;
    responseText += `Longitude: ${location.longitude}\n\n`;
    responseText += `🌍 Approximate IP Information:\n`;
    responseText += `IP: ${ipInfo.query || 'N/A'}\n`;
    responseText += `Country: ${ipInfo.country || 'N/A'}\n`;
    responseText += `Region: ${ipInfo.regionName || 'N/A'}\n`;
    responseText += `City: ${ipInfo.city || 'N/A'}\n`;
    responseText += `ISP: ${ipInfo.isp || 'N/A'}\n`;
    responseText += `Organization: ${ipInfo.org || 'N/A'}`;
    
    // Send response back to Telegram
    await sendTelegramMessage(chatId, responseText);
    
    // Also send the location back as a map for visualization
    await sendTelegramLocation(chatId, location.latitude, location.longitude);
  } else if (update.message && update.message.text) {
    // Handle text messages
    const chatId = update.message.chat.id;
    const text = update.message.text;
    
    // Check if the message is an IP address
    if (isValidIP(text)) {
      const ipInfo = await getIPGeolocation(text);
      
      let responseText = `🔍 IP Information for ${text}:\n`;
      responseText += `Country: ${ipInfo.country || 'N/A'}\n`;
      responseText += `Region: ${ipInfo.regionName || 'N/A'}\n`;
      responseText += `City: ${ipInfo.city || 'N/A'}\n`;
      responseText += `ZIP: ${ipInfo.zip || 'N/A'}\n`;
      responseText += `Lat/Lon: ${ipInfo.lat || 'N/A'}, ${ipInfo.lon || 'N/A'}\n`;
      responseText += `ISP: ${ipInfo.isp || 'N/A'}\n`;
      responseText += `Organization: ${ipInfo.org || 'N/A'}`;
      
      await sendTelegramMessage(chatId, responseText);
      
      // If we have coordinates, send a map
      if (ipInfo.lat && ipInfo.lon) {
        await sendTelegramLocation(chatId, ipInfo.lat, ipInfo.lon);
      }
    } else if (text === '/start') {
      await sendTelegramMessage(chatId, 'Welcome to IP Geolocation Bot! Send me an IP address or a location to get information.');
    } else {
      await sendTelegramMessage(chatId, 'Please send me an IP address or a location to check. For location, use the paperclip icon in Telegram to send your current location.');
    }
  }
  
  return new Response('OK', { status: 200 });
}

// Get IP geolocation from ip-api.com
async function getIPGeolocation(ip) {
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  return await response.json();
}

// Send message to Telegram
async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  };
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// Send location to Telegram
async function sendTelegramLocation(chatId, latitude, longitude) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendLocation`;
  const body = {
    chat_id: chatId,
    latitude: latitude,
    longitude: longitude
  };
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// Simple IP validation
function isValidIP(ip) {
  // IPv4 pattern
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}
