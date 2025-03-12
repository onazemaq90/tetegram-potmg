const BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const CHANNEL_USERNAME = "@lt_MrVirus"; // Change to your channel username

async function handleRequest(request) {
    const data = await request.json();
    const message = data.message || data.callback_query?.message;
    const chatId = message.chat.id;
    const text = message.text || data.callback_query?.data;

    if (text === "/start") {
        return await sendStartMessage(chatId);
    } else if (text === "/joined") {
        return await checkMembership(chatId);
    } else if (text === "/mainmenu") {
        return await sendMainMenu(chatId);
    }

    return new Response("OK");
}

// Send Start Message
async function sendStartMessage(chatId) {
    const joinButtons = [
        [{ text: "🚀 Join Channel 1", url: "https://t.me/Starxnetwork" }, { text: "🚀 Join Channel 2", url: "https://t.me/starxbackup" }],
        [{ text: "🚀 Join Support", url: "https://t.me/StarX_Support" }, { text: "🚀 Updates", url: "https://t.me/+lJ3m8WWL5-BkN2Y1" }],
        [{ text: "✅ Joined ✅", callback_data: "/joined" }]
    ];

    const caption = `*🙋‍♂ Welcome!* \n\n🔎 *You must join our channels before using this bot.*\n\n📢 Click the buttons below to join the required channels.\n✅ After joining, click the 'Joined' button.`;

    await sendPhoto(chatId, "https://t.me/STAR_X_BACKUP/66", caption, joinButtons);
}

// Check Channel Membership
async function checkMembership(chatId) {
    const res = await fetch(`${TELEGRAM_API}/getChatMember?chat_id=${CHANNEL_USERNAME}&user_id=${chatId}`);
    const result = await res.json();

    const userStatus = result.result?.status;
    if (userStatus === "member" || userStatus === "administrator" || userStatus === "creator") {
        await sendMessage(chatId, "*✅ Welcome!*\nYou have successfully joined the channel.");
        await runCommand(chatId, "/mainmenu");
    } else {
        await sendMessage(
            chatId,
            "*⚠️ Channel Subscription Required*\n\nPlease join our channel to use this bot:\n" +
            `${CHANNEL_USERNAME}\n\nAfter joining, type /start again.`
        );
    }
}

// Send Main Menu
async function sendMainMenu(chatId) {
    await sendMessage(
        chatId,
        "🥵 CP (Porn) 🥵, 🥵 CP 2 (Porn) 🥵\n📌 POR 1, POR 2\n📌 POR 3, POR 4\n",
        "*🔥 WELCOME TO THE BOT 🔥*"
    );
}

// Utility Functions
async function sendMessage(chatId, text) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown" })
    });
}

async function sendPhoto(chatId, photoUrl, caption, buttons) {
    await fetch(`${TELEGRAM_API}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: buttons }
        })
    });
}

async function runCommand(chatId, command) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: command })
    });
}

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});
