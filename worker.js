const BOT_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function handleUpdate(update) {
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";

    if (text.startsWith("/start")) {
        await sendMessage(chatId, "🙋‍♂️ Welcome to the bot! Use:\n- `/ip <IP>` for IP info\n- `/tts <text>` for text-to-speech\n- `/instadl <url>` for Instagram video download.");
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
    else if (text.startsWith("/tts")) {
        const ttsText = text.replace("/tts", "").trim();
        if (!ttsText) {
            await sendMessage(chatId, "❌ Please provide text for TTS. Example: `/tts Hello World`");
            return;
        }
        const audioUrl = await generateSpeech(ttsText);
        if (audioUrl) {
            await sendAudio(chatId, audioUrl);
        } else {
            await sendMessage(chatId, "❌ Failed to generate speech. Try again later.");
        }
    } 
    else if (text.startsWith("/instadl")) {
        const url = text.split(" ")[1];
        if (!url) {
            await sendMessage(chatId, "❌ Please provide an Instagram URL. Example: `/instadl <video_url>`");
            return;
        }
        await downloadInstagramMedia(chatId, url);
    } 
    else {
        await sendMessage(chatId, "❓ Unknown command. Try `/start`, `/ip <IP>`, `/tts <text>`, or `/instadl <url>`.");
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
🏙️ *City:* ${data.city}
📡 *ISP:* ${data.isp}
🌐 *IP:* ${data.query}
⏱️ *Timezone:* ${data.timezone}`;
}

async function generateSpeech(text) {
    const res = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
        method: "POST",
        body: JSON.stringify({
            input: `<speak>${text}</speak>`,
            voice_id: "henry",
            audio_format: "mp3"
        }),
        headers: {
            Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
            "Content-Type": "application/json"
        }
    });

    const responseData = await res.json();
    if (responseData.audio_data) {
        const audioData = Buffer.from(responseData.audio_data, "base64");
        const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);
        return audioUrl;
    }
    return null;
}

async function downloadInstagramMedia(chatId, url) {
    const res = await fetch(`https://horridapi.onrender.com/instadl?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.STATUS !== "OK") {
        await sendMessage(chatId, "❌ Not a valid Instagram URL.");
        return;
    }

    const media = [];
    const result = data.result;

    for (const item of result) {
        if (item.media === "image") {
            media.push({ type: "photo", media: item.url });
        } else {
            media.push({ type: "video", media: item.url });
        }
    }

    await sendMediaGroup(chatId, media);
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

async function sendAudio(chatId, audioUrl) {
    await fetch(`${API_URL}/sendAudio`, {
        method: "POST",
        body: JSON.stringify({
            chat_id: chatId,
            audio: audioUrl
        }),
        headers: { "Content-Type": "application/json" }
    });
}

async function sendMediaGroup(chatId, media) {
    await fetch(`${API_URL}/sendMediaGroup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            media: media
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
