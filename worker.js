// Cloudflare Worker code for Telegram Bot
const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'; // Replace with your actual bot token from BotFather
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Store user data (in production, you'd want to use Workers KV or a database)
const users = new Map();

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const { pathname } = new URL(request.url);
  
  // Telegram webhook endpoint
  if (pathname === '/webhook') {
    const update = await request.json();
    await handleTelegramUpdate(update);
    return new Response('OK', { status: 200 });
  }
  
  return new Response('Bot is running', { status: 200 });
}

async function handleTelegramUpdate(update) {
  if (!update.message) return;
  
  const chatId = update.message.chat.id;
  const text = update.message.text || '';
  const userId = update.message.from.id;
  
  // Initialize user if new
  if (!users.has(userId)) {
    users.set(userId, {
      points: 10,
      referrals: 0,
      lastDaily: 0,
      username: update.message.from.username || 'User' + userId
    });
  }
  
  const user = users.get(userId);

  // Handle commands
  switch (text.toLowerCase()) {
    case '/start':
      await sendMessage(chatId, getStartMessage(user.username));
      break;
      
    case '/help':
      await sendMessage(chatId, getHelpMessage());
      break;
      
    // Add more command handlers here as needed
  }
}

function getStartMessage(username) {
  return `🌟✨ Welcome, ${username}! ✨🌟

🔥 Ready to explore exclusive content? I'm your gateway to:
🎥 Hot Videos | 📸 Steamy Photos

🪙 Start with 10 FREE Points!
🔹 Earn more via /refer
🔹 Daily bonuses with /daily

🚨 STRICTLY 18+ ONLY
By continuing, you confirm you're 18+ and agree to our terms

📌 Pro Tip: Check /help for all commands!
🎯 Your current points: 10`;
}

function getHelpMessage() {
  return `🌟 🌟
Your gateway to adult content for 18+ users.

📋 User Commands:
👉 /start - Start the bot
👉 /tutorial - Watch Tutorial Videos
👉 /video 🎥 - Get a random video
👉 /photo 📸 - Get a random photo
👉 /points 🏅 - Check your points balance
👉 /daily 🎁 - Claim your daily bonus points
👉 /refer 🔗 - Generate your referral link
👉 /referral 👥 - Check your referral stats
👉 /buy 💰 - Purchase points from the owner
👉 /top 🏆 - View the top 10 users
👉 /profile 👤 - View your profile details
👉 /sendpoints ✉️ - Send points to another user
👉 /redeem 🔑 - Redeem a token for points

🛠 Admin Commands: (Owner Only)
🔧 /admin - View admin commands`;
}

async function sendMessage(chatId, text) {
  const url = `${BASE_URL}/sendMessage`;
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

// Set up webhook (run this once during deployment)
async function setWebhook() {
  const WEBHOOK_URL = 'tetegram-potmg.bjplover94.workers.dev/webhook'; // Replace with your worker URL
  const url = `${BASE_URL}/setWebhook?url=${WEBHOOK_URL}`;
  await fetch(url);
}
