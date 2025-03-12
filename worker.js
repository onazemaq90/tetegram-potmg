const BOT_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const data = await request.json();

    if (data.message) {
        const msg = data.message;

        if (msg.text === "/start") {
            let joinButtons = [
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

            let userName = msg.from.first_name || "User";
            let userId = msg.from.id || "Unknown";

            return new Response(JSON.stringify({
                method: "sendPhoto",
                chat_id: msg.chat.id,
                photo: "https://t.me/STAR_X_BACKUP/66",
                caption: `*🙋‍♂ Welcome* [${userName}](tg://user?id=${userId})\n\n` +
                    "🔎 *You must join our channels before using this bot.*\n\n" +
                    "📢 *Click the buttons below to join the required channels.*\n" +
                    "✅ After joining, click the **'Joined'** button.",
                reply_markup: { inline_keyboard: joinButtons },
                parse_mode: "Markdown"
            }), { headers: { "Content-Type": "application/json" } });
        }

        if (msg.text === "/joined") {
            return await handleJoinedCommand(msg);
        }

        if (msg.text === "/mainmenu") {
            return await handleMainMenu(msg);
        }
    }

    return new Response("OK");
}

async function handleJoinedCommand(msg) {
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    let userStatus = await checkMembership("@lt_MrVirus", userId);

    if (userStatus === "member" || userStatus === "administrator" || userStatus === "creator") {
        return new Response(JSON.stringify({
            method: "sendMessage",
            chat_id: chatId,
            text: "*✅ Welcome!*\nYou have successfully joined the channel.",
            parse_mode: "Markdown"
        }), { headers: { "Content-Type": "application/json" } });
    } else {
        return new Response(JSON.stringify({
            method: "sendMessage",
            chat_id: chatId,
            text: "*⚠️ Channel Subscription Required*\n\n" +
                "Please join our channel to use this bot:\n" +
                "@lt_MrVirus\n\n" +
                "After joining, type /start again.",
            parse_mode: "Markdown"
        }), { headers: { "Content-Type": "application/json" } });
    }
}

async function checkMembership(channel, userId) {
    const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${channel}&user_id=${userId}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    return result.result.status;
}

async function handleMainMenu(msg) {
    const chatId = msg.chat.id;

    return new Response(JSON.stringify({
        method: "sendMessage",
        chat_id: chatId,
        text: "*🔥 WELCOME TO THE BOT 🔥*\n\n" +
            "🥵 CP (Porn) 🥵, 🥵 CP 2 (Porn) 🥵\n" +
            "📌 POR 1, POR 2\n📌 POR 3, POR 4\n",
        reply_markup: {
            keyboard: [
                ["🥵 CP (Porn) 🥵", "🥵 CP 2 (Porn) 🥵"],
                ["📌 POR 1", "📌 POR 2"],
                ["📌 POR 3", "📌 POR 4"]
            ],
            resize_keyboard: true
        },
        parse_mode: "Markdown"
    }), { headers: { "Content-Type": "application/json" } });
         }
