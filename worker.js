const BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'; // Replace with your actual bot token
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const BOT_USERNAME = 'YourBotName'; // Replace with your bot's username (without @)

// Assumes KV namespace 'USER_POINTS' and 'REFERRALS' are bound
// In wrangler.toml:
// kv_namespaces = [
//   { binding = "USER_POINTS", id = "your-points-kv-id" },
//   { binding = "REFERRALS", id = "your-referrals-kv-id" }
// ]

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json();
    
    if (update.message) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const text = update.message.text;
      
      // Handle commands
      switch (text) {
        case '/start':
          let welcomeMessage = `
𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 ${BOT_USERNAME}! 🎉

Use /help to see available commands

⚠️ 𝗗𝗶𝘀𝗰𝗹𝗮𝗶𝗺𝗲𝗿: 𝙵𝚘𝚛 𝚞𝚜𝚎𝚛𝚜 𝟷𝟾+ 🔞
𝙱𝚢 𝚌𝚘𝚗𝚝𝚒𝚗𝚞𝚒𝚗𝚐, 𝚢𝚘𝚞 𝚌𝚘𝚗𝚏𝚒𝚛𝚖 𝚢𝚘𝚞𝚛 𝚊𝚐𝚎.

𝐄𝐧𝐣𝐨𝐲 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐢𝐛𝐥𝐲! 🥵
          `;
          // Check if this is a referral start
          if (text.startsWith('/start ') && text.length > 7) {
            const referrerId = text.split(' ')[1];
            if (referrerId !== userId.toString()) {
              await handleReferral(referrerId, userId);
              welcomeMessage += `\n\nThanks for joining via a referral!`;
            }
          }
          await sendMessage(chatId, welcomeMessage);
          break;
          
        case '/help':
          const helpMessage = `
<b>Your gateway to adult content for 18+ users.</b>

📋 <b>User Commands:</b>
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

🛠 <b>Admin Commands: (Owner Only)</b>
🔧 /admin - View admin commands
          `;
          await sendMessage(chatId, helpMessage);
          break;

        case '/points':
          const points = await USER_POINTS.get(`points_${userId}`, { type: 'json' }) || 0;
          const pointsMessage = `
🏅 <b>Your Points Balance</b>
User ID: ${userId}
Points: ${points}

Earn more points with:
/daily 🎁 - Daily bonus
/refer 🔗 - Invite friends
          `;
          await sendMessage(chatId, pointsMessage);
          break;

        case '/refer':
          const referralLink = `https://t.me/${BOT_USERNAME}?start=${userId}`;
          const referMessage = `
🔗 <b>Your Referral Link</b>
Invite friends using this link:
${referialLink}

You'll earn 10 points for each friend who joins!
Check stats with /referral 👥
          `;
          await sendMessage(chatId, referMessage);
          break;
      }
    }
    
    return new Response('OK', { status: 200 });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function handleReferral(referrerId, newUserId) {
  // Check if new user hasn't been referred before
  const alreadyReferred = await REFERRALS.get(`referred_${newUserId}`);
  if (!alreadyReferred) {
    // Add points to referrer
    let referrerPoints = await USER_POINTS.get(`points_${referrerId}`, { type: 'json' }) || 0;
    referrerPoints += 10;
    await USER_POINTS.put(`points_${referrerId}`, JSON.stringify(referrerPoints));
    
    // Record referral
    await REFERRALS.put(`referred_${newUserId}`, referrerId);
    
    // Update referrer's referral count
    const referralCount = await REFERRALS.get(`referrals_${referrerId}`, { type: 'json' }) || 0;
    await REFERRALS.put(`referrals_${referrerId}`, JSON.stringify(referralCount + 1));
  }
}

async function sendMessage(chatId, text) {
  const url = `${BASE_URL}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text.trim(),
    parse_mode: 'HTML'
  };
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
