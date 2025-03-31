const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function handleRequest(request) {
  if (request.method === 'POST') {
    try {
      const update = await request.json();
      await handleUpdate(update);
      return new Response('OK');
    } catch (error) {
      return new Response('Error processing update', { status: 500 });
    }
  }
  return new Response('Method not allowed', { status: 405 });
}

async function handleUpdate(update) {
  if (!update.message || !update.message.text) return;
  
  const chatId = update.message.chat.id;
  const text = update.message.text;
  const firstName = update.message.from.first_name || 'User';
  
  if (text.startsWith('/start')) {
    await sendStartMessage(chatId, firstName);
  } else if (text.startsWith('/help')) {
    await sendHelpMessage(chatId);
  }
}

async function sendStartMessage(chatId, firstName) {
  const message = `🌟✨ Welcome, ${firstName}! ✨🌟

🔥 Ready to explore exclusive content? I'm your gateway to:
🎥 Hot Videos | 📸 Steamy Photos

🪙 Start with 10 FREE Points!
🔹 Earn more via /refer
🔹 Daily bonuses with /daily

🚨 STRICTLY 18+ ONLY
By continuing, you confirm you're 18+ and agree to our terms

📌 Pro Tip: Check /help for all commands!
🎯 Your current points: 10`;

  await sendMessage(chatId, message);
}

async function sendHelpMessage(chatId) {
  const message = `🌟 🌟
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

  await sendMessage(chatId, message);
}

async function sendMessage(chatId, text) {
  const url = `${BASE_URL}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown'
  };
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
