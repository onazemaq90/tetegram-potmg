// cloudflare-worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    return handleTelegramUpdate(await request.json())
  }
  return new Response('Hello from Pinterest Downloader Bot!')
}

async function handleTelegramUpdate(update) {
  const token = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
  const apiUrl = `https://api.telegram.org/bot${token}`;
  const chatId = update.message?.chat.id;
  const messageText = update.message?.text;

  // Handle /start command
  if (messageText === '/start') {
    const welcomeMessage = `🎉 *Welcome to Pinterest Downloader Bot* 🎉\n\n🔍 Send me any Pinterest link and I'll fetch the content for you!\n\n☣️ Powered by Cloudflare Workers`;
    
    return fetch(`${apiUrl}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        chat_id: chatId,
        text: welcomeMessage,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            {text: '🌟 Star on GitHub', url: 'https://github.com/your-repo'},
            {text: '📚 Help', callback_data: 'help'}
          ]]
        }
      })
    })
  }

  // Handle Pinterest URLs
  if (messageText?.match(/pinterest\.com\/pin/)) {
    const pinUrl = messageText;
    try {
      const mediaUrl = await getPinterestMedia(pinUrl);
      
      return fetch(`${apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          chat_id: chatId,
          text: `☣️ *Download Ready!* ☣️\n\nChoose format:`,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {text: '📥 Download Image', url: mediaUrl.image},
                {text: '🎥 Download Video', url: mediaUrl.video}
              ],
              [{text: '🔄 Try Another', callback_data: 'refresh'}]
            ]
          }
        })
      })
    } catch (error) {
      return fetch(`${apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          chat_id: chatId,
          text: '❌ Error processing Pinterest link. Please try again.'
        })
      })
    }
  }

  return new Response('OK')
}

async function getPinterestMedia(url) {
  // Replace with actual Pinterest media extraction logic
  // This is a simplified example - you'll need proper parsing
  const pinId = url.split('/pin/')[1].split('/')[0];
  return {
    image: `https://i.pinimg.com/originals/${pinId}.jpg`,
    video: `https://v1.pinimg.com/videos/${pinId}.mp4`
  }
}
