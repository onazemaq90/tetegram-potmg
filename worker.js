// Cloudflare Worker Telegram IP Check Bot
const TELEGRAM_BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';
const IP_API_URL = 'http://ip-api.com/json/';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    try {
      const update = await request.json();
      if (update.message) {
        await handleMessage(update.message);
      }
      return new Response('OK');
    } catch (error) {
      return new Response('Error processing request', { status: 500 });
    }
  }
  return new Response('Not found', { status: 404 });
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text || '';
  
  if (text.startsWith('/start')) {
    await sendMessage(chatId, 'Welcome to IP Check Bot! Send /ip [address] to check IP information.');
  } else if (text.startsWith('/ip')) {
    const ip = text.split(' ')[1] || '';
    if (!ip) {
      await sendMessage(chatId, 'Please provide an IP address. Example: /ip 8.8.8.8');
      return;
    }
    
    await sendMessage(chatId, '⏳ Please wait while I check the IP...');
    await checkIP(chatId, ip);
  }
}

async function checkIP(chatId, ip) {
  try {
    const response = await fetch(`${IP_API_URL}${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query`);
    const data = await response.json();
    
    if (data.status === 'fail') {
      await sendMessage(chatId, `❌ Error: ${data.message}`);
      return;
    }
    
    // Format the response
    let message = `🔍 IP Information for ${data.query}:\n\n`;
    message += `📍 Location: ${data.city}, ${data.regionName}, ${data.country}\n`;
    message += `🌐 Continent: ${data.continent} (${data.continentCode})\n`;
    message += `🏛️ Region: ${data.regionName} (${data.region})\n`;
    message += `📮 ZIP: ${data.zip}\n`;
    message += `🕒 Timezone: ${data.timezone} (UTC offset: ${data.offset})\n`;
    message += `💱 Currency: ${data.currency}\n\n`;
    message += `🛜 ISP: ${data.isp}\n`;
    message += `🏢 Organization: ${data.org}\n`;
    message += `🖥️ AS: ${data.as} (${data.asname})\n\n`;
    message += `📱 Mobile: ${data.mobile ? 'Yes' : 'No'}\n`;
    message += `🛡️ Proxy: ${data.proxy ? 'Yes' : 'No'}\n`;
    message += `☁️ Hosting: ${data.hosting ? 'Yes' : 'No'}\n`;
    
    // Send the text response
    await sendMessage(chatId, message);
    
    // Send the location as a map
    if (data.lat && data.lon) {
      await sendLocation(chatId, data.lat, data.lon);
      
      // Alternatively, send a static map image
      const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${data.lat},${data.lon}&zoom=12&size=600x300&maptype=roadmap&markers=color:red%7C${data.lat},${data.lon}&key=YOUR_GOOGLE_MAPS_API_KEY`;
      await sendPhoto(chatId, mapUrl);
    }
    
  } catch (error) {
    await sendMessage(chatId, '❌ Error fetching IP information. Please try again later.');
  }
}

// Telegram API helpers
async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}

async function sendLocation(chatId, lat, lon) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendLocation`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      latitude: lat,
      longitude: lon
    })
  });
}

async function sendPhoto(chatId, photoUrl) {
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
