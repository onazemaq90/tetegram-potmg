const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Video & Photo Links
const videoLinks = [
    "https://t.me/developer_64/48",
    "https://t.me/developer_64/49",
    "https://t.me/developer_64/50",
    "https://t.me/developer_64/51",
    "https://t.me/developer_64/52",
    "https://t.me/developer_64/42",
    "https://t.me/developer_64/43",
    "https://t.me/developer_64/44",
    "https://t.me/developer_64/45",
    "https://t.me/developer_64/46",
];

const photoLinks = [
    "https://t.me/developer_64/30",
    "https://t.me/developer_64/31",
    "https://t.me/developer_64/32",
    "https://t.me/developer_64/33",
    "https://t.me/developer_64/34"
];

// Handle Telegram Bot Commands
async function handleUpdate(update) {
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text;

    const userId = message.from.id.toString();
    const username = message.from.username || "User";

    let userData = await KV.get(userId);
    userData = userData ? JSON.parse(userData) : { points: 0, premium: false, referrals: 0 };

    if (text === "/start") {
        await sendMessage(chatId, `👋 Welcome ${username}!\n\nUse /help to see available commands.`);
    }

    // Help Command
    else if (text === "/help") {
        await sendMessage(chatId, `
🔞 *Your gateway to adult content for 18+ users.*  

📋 *User Commands:*  
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
  
🛠 *Admin Commands:*  
🔧 /admin - View admin commands  
`);
    }

    // Random Video
    else if (text === "/video") {
        const randomVideo = videoLinks[Math.floor(Math.random() * videoLinks.length)];
        await sendVideo(chatId, randomVideo, "🎥 *Here's a random video for you!*");
    }

    // Random Photo
    else if (text === "/photo") {
        const randomPhoto = photoLinks[Math.floor(Math.random() * photoLinks.length)];
        await sendPhoto(chatId, randomPhoto, "📸 *Here's a random photo for you!*");
    }

    // Points System
    else if (text === "/points") {
        await sendMessage(chatId, `
🏅 *Your Points Balance*  
💰 *Points:* ${userData.points}  
👑 *Premium Status:* ${userData.premium ? "✅ Yes" : "❌ No"}  
👥 *Referrals:* ${userData.referrals || 0}  
`);
    }

    // Daily Bonus
    else if (text === "/daily") {
        const lastClaim = await KV.get(`daily_${userId}`);
        const currentTime = Date.now();

        if (lastClaim && currentTime - parseInt(lastClaim) < 24 * 60 * 60 * 1000) {
            await sendMessage(chatId, "❌ You've already claimed your daily bonus. Try again tomorrow!");
            return;
        }

        userData.points += 3;
        await KV.put(userId, JSON.stringify(userData));
        await KV.put(`daily_${userId}`, currentTime.toString());

        await sendMessage(chatId, `🎁 *Daily Bonus Claimed!* ✅ You've received *3 points*.`);
    }

    // Referral System
    else if (text === "/refer") {
        const refCode = `ref_${userId}`;
        await sendMessage(chatId, `🔗 *Your Referral Link:* [Click Here](https://t.me/${BOT_USERNAME}?start=${refCode})`);
    }

    // Purchase Points Guide
    else if (text === "/buy") {
        await sendMessage(chatId, `
💰 *Purchase Points*  
➤ 50 Points = $5  
➤ 100 Points = $9  
➤ 500 Points = $40  
➤ 1000 Points = $75  

📞 Contact the Owner: [Owner's Telegram](https://t.me/YourOwnerUsername)
`);
    }

    // Admin Commands
    else if (text === "/admin") {
        await sendMessage(chatId, `
🛠 *Admin Commands:*  
➤ /addpremium <user_id> - Add Premium User  
➤ /addfreepoints <user_id> - Add 5 Free Points  
`);
    }
}

// Utility Functions
async function sendMessage(chatId, text) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: "Markdown",
        }),
    });
}

async function sendVideo(chatId, videoUrl, caption) {
    await fetch(`${TELEGRAM_API}/sendVideo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            video: videoUrl,
            caption: caption,
            parse_mode: "Markdown"
        }),
    });
}

async function sendPhoto(chatId, photoUrl, caption) {
    await fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: "Markdown"
        }),
    });
}

export default {
    async fetch(request) {
        const { message } = await request.json();
        await handleUpdate({ message });
        return new Response("OK");
    },
};
