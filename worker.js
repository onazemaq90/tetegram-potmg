const TELEGRAM_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4"; 
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function handleRequest(request) {
    const body = await request.json();
    const message = body.message || body.callback_query;
    const chatId = message.chat.id;
    const command = message.text || message.data;

    if (command === "/start") {
        return await sendStartMessage(chatId);
    } else if (command === "/join") {
        return await checkUserJoin(chatId, message.message_id, message.from.id);
    } else if (command === "/VBMENU") {
        return await sendVBMenu(chatId);
    }

    return new Response("OK");
}

async function sendStartMessage(chatId) {
    const buttons = [
        [{ text: "👨‍💻 Developer", url: "tg://openmessage?user_id=6449612223" }],
        [{ text: "🔊 Updates", url: "https://t.me/addlist/P9nJIi98NfY3OGNk" }],
        [{ text: "✅", callback_data: "/join" }]
    ];

    const messageText = "⭐️ To Usᴇ Tʜɪs Bᴏᴛ Yᴏᴜ Nᴇᴇᴅ Tᴏ Jᴏɪɴ Aʟʟ Cʜᴀɴɴᴇʟs -";
    const photoUrl = "https://t.me/kajal_developer/9";

    await fetch(`${BASE_URL}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            photo: photoUrl,
            caption: messageText,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
            reply_markup: { inline_keyboard: buttons }
        })
    });
}

async function checkUserJoin(chatId, messageId, userId) {
    await fetch(`${BASE_URL}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId
        })
    });

    const channel = "@kajal_developer";
    const chatMemberRes = await fetch(`${BASE_URL}/getChatMember`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: channel,
            user_id: userId
        })
    });

    const result = await chatMemberRes.json();
    const status = result.result?.status || "left";

    if (["member", "administrator", "creator"].includes(status)) {
        await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: "✅ Successfully Verified! Welcome to the Bot.",
            })
        });
        return await sendVBMenu(chatId);
    } else {
        await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: chatId,
                text: "❌ Must join all channels: @kajal_developer"
            })
        });
    }
}

async function sendVBMenu(chatId) {
    await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text: "🤗 Welcome to Lx Bot 🌺\n\n🌺 CP, 🇮🇳 Desi\n🇬🇧 Forener,🐕‍🦺 Animal\n💕 Webseries,\n💑 Gay Cp\n💸 𝘽𝙐𝙔 𝙑𝙄𝙋 💸"
        })
    });
}

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});
