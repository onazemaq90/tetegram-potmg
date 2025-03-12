const BOT_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const WAIFU_API = "https://api.waifu.pics";

async function handleUpdate(update) {
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";
    const callbackQuery = update.callback_query;

    // Handle Callback Queries
    if (callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const category = callbackQuery.data;
        const imageUrl = await fetchWaifuImage("sfw", category);
        await sendPhoto(chatId, imageUrl, `Here is your **${category}** image!`);
        return;
    }

    if (text.startsWith("/start")) {
        await sendMessage(chatId, "🙋‍♂️ Welcome! Use `/gen` to generate anime images.");
    } 
    else if (text.startsWith("/gen")) {
        await sendCategoryButtons(chatId);
    } 
    else {
        await sendMessage(chatId, "❓ Unknown command. Try `/start` or `/gen`.");
    }
}

async function fetchWaifuImage(type, category) {
    const response = await fetch(`${WAIFU_API}/${type}/${category}`, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = await response.json();
    return data.url || null;
}

async function sendCategoryButtons(chatId) {
    const keyboard = {
        inline_keyboard: [
            [{ text: "🟠 WAIFU", callback_data: "waifu" }, { text: "🟣 NEKO", callback_data: "neko" }],
            [{ text: "🟡 SHINOBU", callback_data: "shinobu" }, { text: "🔴 MEGUMIN", callback_data: "megumin" }],
            [{ text: "😈 BULLY", callback_data: "bully" }, { text: "🤗 CUDDLE", callback_data: "cuddle" }],
            [{ text: "🚫 TRAP", callback_data: "trap" }, { text: "💋 BLOWJOB", callback_data: "blowjob" }]
        ]
    };

    await fetch(`${API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: "🎨 *Choose a category to generate an anime image:*",
            reply_markup: keyboard,
            parse_mode: "Markdown"
        })
    });
}

async function sendPhoto(chatId, imageUrl, caption) {
    await fetch(`${API_URL}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            photo: imageUrl,
            caption: caption,
            parse_mode: "Markdown"
        })
    });
}

async function sendMessage(chatId, text) {
    await fetch(`${API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: "Markdown"
        })
    });
}

export default {
    async fetch(request) {
        if (request.method === "POST") {
            const update = await request.json();
            await handleUpdate(update);
            return new Response("OK");
        }
        return new Response("Bot is active.");
    }
};
