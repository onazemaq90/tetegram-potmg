const BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4'; // Replace with your actual bot token from BotFather
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const BOT_USERNAME = 'Lx_porn_video_Bot'; // Replace with your bot's username
const OWNER_ID = '7912527708'; // Replace with owner's Telegram user ID
const DAILY_POINTS = 50; // Daily bonus amount, adjust as needed
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Assumes KV namespaces 'USER_POINTS', 'USER_REFERRALS', 'TOP_USERS', and 'USER_DATA' are bound
// In wrangler.toml:
// kv_namespaces = [
//   { binding = "USER_POINTS", id = "your-points-kv-id" },
//   { binding = "USER_REFERRALS", id = "your-referrals-kv-id" },
//   { binding = "TOP_USERS", id = "your-top-users-kv-id" },
//   { binding = "USER_DATA", id = "your-user-data-kv-id" }
// ]

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json();
    
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const text = update.message.text;
      
      switch (true) {
        case text === '/start':
          const welcomeMessage = `
𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 ${BOT_USERNAME}! 🎉
Use /help to see available commands

⚠️ 𝗗𝗶𝘀𝗰𝗹𝗮𝗶𝗺𝗲𝗿: 𝙵𝚘𝚛 𝚞𝚜𝚎𝚛𝚜 𝟷𝟾+ 🔞
𝙱𝚢 𝚌𝚘𝚗𝚝𝚒𝚗𝚞𝚒𝚗𝚐, 𝚢𝚘𝚞 𝚌𝚘𝚗𝚏𝚒𝚛𝚖 𝚢𝚘𝚞𝚛 𝚊𝚐𝚎.
𝐄𝐧𝐣𝐨𝐲 𝐫𝐞𝐬𝐩𝐨𝐧𝐬𝐢𝐛𝐥𝐲! 🥵
          `;
          await initializeUser(userId);
          await sendMessage(chatId, welcomeMessage);
          break;
          
        case text.startsWith('/start ref_'):
          const referrerId = text.split('ref_')[1];
          const refWelcomeMessage = `
𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼 ${BOT_USERNAME}! 🎉
You were referred by user ${referrerId}.
Use /help to see available commands

⚠️ 𝗗𝗶𝘀𝗰𝗹𝗮𝗶𝗺𝗲𝗿: 𝙵𝚘𝚛 𝚞𝚜𝚎𝚛𝚜 𝟷𝟾+ 🔞
          `;
          await initializeUser(userId);
          await recordReferral(referrerId, userId);
          await sendMessage(chatId, refWelcomeMessage);
          break;
          
        case text === '/help':
          const helpMessage = `
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
🔧 /admin - View admin commands
          `;
          await sendMessage(chatId, helpMessage);
          break;
          
        case text === '/points':
          const points = await getUserPoints(userId);
          const pointsMessage = `
🏅 Your Points Balance:
Current Points: ${points} points
Use your points to unlock premium content!
          `;
          await sendMessage(chatId, pointsMessage);
          break;

        case text === '/refer':
          const referralLink = `https://t.me/${BOT_USERNAME}?start=ref_${userId}`;
          const referMessage = `
🔗 Your Referral Link:
${referralLink}

Share this link with friends! You'll earn bonus points when they join using your link.
Use /referral to check your referral stats.
          `;
          await sendMessage(chatId, referMessage);
          break;

        case text === '/referral':
          const referralStats = await getReferralStats(userId);
          const referralMessage = `
👥 Your Referral Stats:
Total Referrals: ${referralStats.count}
Referral Points Earned: ${referralStats.points} points

Keep sharing your referral link to earn more points!
          `;
          await sendMessage(chatId, referralMessage);
          break;

        case text === '/buy':
          const buyMessage = `
💰 Buy Points:
Available Packages:
- 100 points: $1
- 500 points: $4
- 1000 points: $7

To purchase:
1. Contact @${BOT_USERNAME}Owner (ID: ${OWNER_ID})
2. Send payment via [Your preferred method]
3. Include your User ID: ${userId}
4. Wait for confirmation

Points will be added after payment verification!
          `;
          await sendMessage(chatId, buyMessage);
          break;

        case text.startsWith('/addpoints') && userId.toString() === OWNER_ID:
          const [_, targetUserId, amount] = text.split(' ');
          if (targetUserId && amount) {
            await addPoints(targetUserId, parseInt(amount));
            await sendMessage(chatId, `Added ${amount} points to user ${targetUserId}`);
            await sendMessage(targetUserId, `🎉 You've received ${amount} points from the owner!`);
          }
          break;

        case text === '/top':
          const topUsers = await getTopUsers();
          let topMessage = '🏆 Top 10 Users by Points:\n\n';
          topUsers.forEach((user, index) => {
            topMessage += `${index + 1}. User ${user.userId}: ${user.points} points\n`;
          });
          await sendMessage(chatId, topMessage);
          break;

        case text === '/profile':
          const points = await getUserPoints(userId);
          const referralStats = await getReferralStats(userId);
          const userData = await getUserData(userId);
          const profileMessage = `
👤 Your Profile:
User ID: ${userId}
Points: ${points} points
Total Referrals: ${referralStats.count}
Referral Points: ${referralStats.points} points
Joined: ${new Date(userData.joinDate).toLocaleDateString()}

Keep earning points to unlock more features!
          `;
          await sendMessage(chatId, profileMessage);
          break;

        case text.startsWith('/sendpoints'):
          const [__, targetUserId, amountStr] = text.split(' ');
          if (!targetUserId || !amountStr) {
            await sendMessage(chatId, 'Usage: /sendpoints <userId> <amount>');
            break;
          }
          
          const sendAmount = parseInt(amountStr);
          if (isNaN(sendAmount) || sendAmount <= 0) {
            await sendMessage(chatId, 'Please enter a valid positive amount');
            break;
          }

          const senderPoints = await getUserPoints(userId);
          if (senderPoints < sendAmount) {
            await sendMessage(chatId, 'Insufficient points! Check your balance with /points');
            break;
          }

          await initializeUser(targetUserId);
          await transferPoints(userId, targetUserId, sendAmount);
          await sendMessage(chatId, `✉️ Successfully sent ${sendAmount} points to user ${targetUserId}`);
          await sendMessage(targetUserId, `✉️ You've received ${sendAmount} points from user ${userId}!`);
          break;

        case text === '/daily':
          const userData = await getUserData(userId);
          const now = Date.now();
          const lastClaim = userData.lastDailyClaim || 0;
          
          if (now - lastClaim < DAILY_COOLDOWN) {
            const timeLeft = DAILY_COOLDOWN - (now - lastClaim);
            const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
            await sendMessage(chatId, `⏳ You can claim again in ${hoursLeft} hours. Come back later!`);
            break;
          }

          await addPoints(userId, DAILY_POINTS);
          await USER_DATA.put(userId.toString(), JSON.stringify({
            ...userData,
            lastDailyClaim: now
          }));
          
          await sendMessage(chatId, `🎁 You've claimed your daily bonus of ${DAILY_POINTS} points! Check back tomorrow!`);
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
      parse_mode: 'Markdown'
    })
  });
}

// User management functions
async function initializeUser(userId) {
  const existingPoints = await USER_POINTS.get(userId.toString());
  if (!existingPoints) {
    await USER_POINTS.put(userId.toString(), '0');
    await USER_DATA.put(userId.toString(), JSON.stringify({
      joinDate: Date.now()
    }));
    await updateTopUsers(userId, 0);
  }
}

async function getUserPoints(userId) {
  const points = await USER_POINTS.get(userId.toString());
  return points ? parseInt(points) : 0;
}

async function addPoints(userId, amount) {
  const currentPoints = await getUserPoints(userId);
  const newPoints = currentPoints + amount;
  await USER_POINTS.put(userId.toString(), newPoints.toString());
  await updateTopUsers(userId, newPoints);
}

async function transferPoints(fromUserId, toUserId, amount) {
  const fromPoints = await getUserPoints(fromUserId);
  const toPoints = await getUserPoints(toUserId);
  
  await USER_POINTS.put(fromUserId.toString(), (fromPoints - amount).toString());
  await USER_POINTS.put(toUserId.toString(), (toPoints + amount).toString());
  
  await updateTopUsers(fromUserId, fromPoints - amount);
  await updateTopUsers(toUserId, toPoints + amount);
}

async function getUserData(userId) {
  const data = await USER_DATA.get(userId.toString(), { type: 'json' });
  return data || { joinDate: Date.now() };
}

async function recordReferral(referrerId, newUserId) {
  const referralKey = `ref_${referrerId}`;
  let referrals = await USER_REFERRALS.get(referralKey, { type: 'json' });
  
  if (!referrals) {
    referrals = { count: 0, points: 0, users: [] };
  }
  
  if (!referrals.users.includes(newUserId)) {
    referrals.count += 1;
    referrals.points += 10;
    referrals.users.push(newUserId);
    
    await USER_REFERRALS.put(referralKey, JSON.stringify(referrals));
    await addPoints(referrerId, 10);
  }
}

async function getReferralStats(userId) {
  const referralKey = `ref_${userId}`;
  const referrals = await USER_REFERRALS.get(referralKey, { type: 'json' });
  
  return referrals || { count: 0, points: 0 };
}

async function updateTopUsers(userId, points) {
  let topUsers = await TOP_USERS.get('leaderboard', { type: 'json' }) || [];
  
  const userIndex = topUsers.findIndex(u => u.userId === userId);
  if (userIndex !== -1) {
    topUsers[userIndex].points = points;
  } else {
    topUsers.push({ userId, points });
  }
  
  topUsers.sort((a, b) => b.points - a.points);
  topUsers = topUsers.slice(0, 10);
  
  await TOP_USERS.put('leaderboard', JSON.stringify(topUsers));
}

async function getTopUsers() {
  const topUsers = await TOP_USERS.get('leaderboard', { type: 'json' }) || [];
  return topUsers;
}
