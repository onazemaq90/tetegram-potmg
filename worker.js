const BOT_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function handleUpdate(update) {
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";

    if (text.startsWith("/start")) {
        await sendMessage(chatId, "🙋‍♂️ Welcome to the bot! Use `/ip` followed by an IP address to get details.");
    } 
    else if (text.startsWith("/ip")) {
        const ipAddress = text.split(" ")[1];
        if (!ipAddress) {
            await sendMessage(chatId, "❌ Please provide an IP address. Example: `/ip 8.8.8.8`");
            return;
        }
        const ipData = await fetchIPInfo(ipAddress);
        await sendMessage(chatId, ipData);
    } 
    else {
        await sendMessage(chatId, "❓ Unknown command. Try `/start` or `/ip <IP_ADDRESS>`.");
    }
}

async function fetchIPInfo(ip) {
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();

    if (data.status === "fail") {
        return `❌ Invalid IP address or not found.`;
    }

    return `🌍 *IP Information*\n
📍 *Country:* ${data.country}
↪️ *CountryCode:* ${data.countryCode}
🏙️ *City:* ${data.city}
⚡ *zip:* ${data.zip}
📡 *ISP:* ${data.isp}
🌐 *IP:* ${data.query}
⏱️ *Timezone:* ${data.timezone}`;
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
