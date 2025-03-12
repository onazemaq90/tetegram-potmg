addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const data = await request.json();

    const text = data.message?.text || "";
    const chatId = data.message?.chat?.id;

    if (text.startsWith("/start")) {
        return await sendStartMessage(chatId);
    } else if (text.startsWith("/joined")) {
        return await handleJoined(chatId);
    } else if (text.startsWith("/mainmenu")) {
        return await sendMainMenu(chatId);
    }

    return new Response("OK");
}

// /start Command
async function sendStartMessage(chatId) {
    const joinButtons = [
        [
            { text: "🚀 Join Channel 1", url: "https://t.me/Starxnetwork" },
            { text: "🚀 Join Channel 2", url: "https://t.me/starxbackup" }
        ],
        [
            { text: "🚀 Join Support", url: "https://t.me/StarX_Support" },
            { text: "🚀 Updates", url: "https://t.me/+lJ3m8WWL5-BkN2Y1" }
        ],
        [
            { text: "✅ Joined ✅", callback_data: "/joined" }
        ]
    ];

    const message = `*🙋‍♂ Welcome!*\n\n🔎 *You must join our channels before using this bot.*\n\n📢 Click the buttons below to join the required channels.\n✅ After joining, click the **'Joined'** button.`;

    await sendTelegramRequest("sendPhoto", {
        chat_id: chatId,
        photo: "https://t.me/STAR_X_BACKUP/66",
        caption: message,
        reply_markup: { inline_keyboard: joinButtons },
        parse_mode: "Markdown"
    });
}

// /joined Command
async function handleJoined(chatId) {
    const channel2 = "@lt_MrVirus";

    const memberStatus = await getChatMemberStatus(chatId, channel2);

    if (memberStatus === "member" || memberStatus === "administrator" || memberStatus === "creator") {
        await sendTelegramRequest("sendMessage", {
            chat_id: chatId,
            text: "*✅ Welcome!*\nYou have successfully joined the channel."
        });
        await sendMainMenu(chatId);
    } else {
        await sendTelegramRequest("sendMessage", {
            chat_id: chatId,
            text: "*⚠️ Channel Subscription Required*\n\nPlease join our channel to use this bot:\n@lt_MrVirus\n\nAfter joining, type /start again."
        });
    }
}

// /mainmenu Command
async function sendMainMenu(chatId) {
    const mainMenu = "🥵 CP (Porn) 🥵, 🥵 CP 2 (Porn) 🥵\n📌 POR 1, POR 2\n📌 POR 3, POR 4\n";

    await sendTelegramRequest("sendMessage", {
        chat_id: chatId,
        text: "*🔥 WELCOME TO THE BOT 🔥*",
        reply_markup: {
            keyboard: [
                ["🥵 CP (Porn) 🥵", "🥵 CP 2 (Porn) 🥵"],
                ["📌 POR 1", "📌 POR 2"],
                ["📌 POR 3", "📌 POR 4"]
            ],
            resize_keyboard: true
        }
    });
}

// Helper function to send requests to Telegram API
async function sendTelegramRequest(method, body) {
    const token = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
    await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
}

// Helper function to check channel membership
async function getChatMemberStatus(userId, channel) {
    const token = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
    const response = await fetch(`https://api.telegram.org/bot${token}/getChatMember?chat_id=${channel}&user_id=${userId}`);
    const result = await response.json();
    return result?.result?.status || "left";
}
