const BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4'; // Replace with your actual bot token from BotFather
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json();
    
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      
      // Handle different commands
      switch (text) {
        case '/start':
          const welcomeMessage = `
𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 YourBotName! 🎉
Use /help to see available commands

⚠️ 𝗗𝗶𝘀𝗰𝗹𝗮𝗶𝗺𝗲𝗿: 𝙵𝚘𝚛 𝚞𝚜𝚎𝚛𝚜 𝟷𝟾+ 🔞
𝙱𝚢 𝚌𝚘𝚗𝚝𝚒𝚗𝚞𝚒𝚗𝚐, 𝚢𝚘𝚞 𝚌𝚘𝚗𝚏𝚒𝚛𝚖 𝚢𝚘𝚞𝚛 𝚊𝚐𝚎.
𝐄𝐧𝐣𝐨𝐲 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐢𝐛𝐥𝐲! 🥵
          `;
          await sendMessage(chatId, welcomeMessage);
          break;
          
        case '/help':
          const helpMessage = `
Available commands:
/start - Start the bot
/help - Show this help message
          `;
          await sendMessage(chatId, helpMessage);
          break;
      }
    }
    
    return new Response('OK', { status: 200 });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function sendMessage(chatId, text) {
  const url = `${BASE_URL}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown' // Optional: enables bold text with ** or __
    })
  });
}
