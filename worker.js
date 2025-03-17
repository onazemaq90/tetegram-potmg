const TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

const USER_DATA = {};

async function handleRequest(request) {
    const data = await request.json();
    const message = data.message || data.callback_query?.message;

    if (message) {
        const chatId = message.chat.id;
        const text = message.text || data.callback_query?.data;
        const userId = message.from.id;

        if (!USER_DATA[userId]) {
            USER_DATA[userId] = { 
                premium: false, 
                points: 5, 
                referrals: 0 
            };
        }

        if (text === "/start") {
            return sendMenu(chatId, userId);
        } else if (text === "/addpremium") {
            USER_DATA[userId].premium = true;
            return sendMessage(chatId, "✅ *You are now a Premium user with Unlimited Access!*", 'Markdown');
        } else if (text === "/addpoints") {
            USER_DATA[userId].points += 5;
            return sendMessage(chatId, `🎯 *You've received 5 points!*\n\n🔹 Current Points: ${USER_DATA[userId].points}`, 'Markdown');
        } else if (text === "/genpoints") {
            USER_DATA[userId].points += 1;
            return sendMessage(chatId, `✅ *1 Point Generated!*\n\n💰 Total Points: ${USER_DATA[userId].points}`, 'Markdown');
        } else if (text === "/redeem") {
            if (USER_DATA[userId].points >= 10) {
                USER_DATA[userId].points -= 10;
                return sendMessage(chatId, "🎁 *Successfully Redeemed 10 Points!*\n\n💰 Remaining Points: " + USER_DATA[userId].points, 'Markdown');
            } else {
                return sendMessage(chatId, "❌ *Not enough points to redeem!*\n\n💰 Your Points: " + USER_DATA[userId].points, 'Markdown');
            }
        } else if (text.startsWith("/refer")) {
            const refUserId = text.split(' ')[1];
            if (refUserId && refUserId != userId) {
                USER_DATA[refUserId].points += 10;
                return sendMessage(chatId, "🎉 *You've successfully referred a user!*\n\n💰 +10 Points Added!", 'Markdown');
            } else {
                return sendMessage(chatId, "❌ *Invalid referral attempt!*", 'Markdown');
            }
        } else if (text === "/video") {
            USER_DATA[userId].points += 1;
            return sendMedia(chatId, "https://example.com/video.mp4", "🎬 *Here's your random video!* (Earned 1 Point)");
        } else if (text === "/photo") {
            USER_DATA[userId].points += 1;
            return sendMedia(chatId, "https://example.com/photo.jpg", "📸 *Here's your random photo!* (Earned 1 Point)");
        }
    }

    return new Response("OK");
}

// Send Menu Function
async function sendMenu(chatId, userId) {
    const buttons = {
        inline_keyboard: [
            [{ text: "💎 Add Premium", callback_data: "/addpremium" }],
            [{ text: "➕ Add Points", callback_data: "/addpoints" }],
            [{ text: "🧩 Generate Points", callback_data: "/genpoints" }],
            [{ text: "🎁 Redeem Points", callback_data: "/redeem" }],
            [{ text: "🎯 Refer User", callback_data: `/refer ${userId}` }],
            [{ text: "📹 Random Video", callback_data: "/video" }, { text: "📸 Random Photo", callback_data: "/photo" }]
        ]
    };

    return sendMessage(chatId, `👋 Welcome!\n\n🔹 *Premium:* ${USER_DATA[userId].premium ? "✅ Yes" : "❌ No"}\n💰 *Points:* ${USER_DATA[userId].points}`, 'Markdown', buttons);
}

// Send Message Function
async function sendMessage(chatId, text, parseMode = 'Markdown', replyMarkup = null) {
    const payload = { chat_id: chatId, text, parse_mode: parseMode };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// Send Media (Photo/Video) Function
async function sendMedia(chatId, mediaUrl, caption) {
    const payload = {
        chat_id: chatId,
        video: mediaUrl,
        caption: caption,
        parse_mode: "Markdown"
    };

    await fetch(`${BASE_URL}/sendVideo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
