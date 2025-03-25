const TELEGRAM_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';  // Use Cloudflare Environment Variable
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    if (request.method === 'POST') {
        const update = await request.json();
        return handleUpdate(update);
    }
    return new Response('OK');
}

async function handleUpdate(update) {
    if (update.callback_query) {
        return await handleCallback(update.callback_query);
    }

    if (update.message) {
        return await handleMessage(update.message);
    }

    return new Response('OK');
}

// Handle Text Messages
async function handleMessage(message) {
    const text = message.text;
    const chatId = message.chat.id;
    const user = message.from;

    if (!text) return new Response('OK');

    switch (text) {
        case '/start':
            await sendWelcomeMessage(chatId, user);
            break;
        case '/Commands':
            await deleteMessage(chatId, message.message_id);
            await sendCommandsMenu(chatId);
            break;
        case '/about':
            await sendAboutMessage(chatId, user);
            break;
    }

    return new Response('OK');
}

// Handle Callback Queries
async function handleCallback(callback) {
    const data = callback.data;
    const chatId = callback.message.chat.id;
    const messageId = callback.message.message_id;

    switch (data) {
        case '/Commands':
            await deleteMessage(chatId, messageId);
            await sendCommandsMenu(chatId);
            break;
        case '/black':
            await deleteMessage(chatId, messageId);
            await sendGatewayMessage(chatId);
            break;
        case '/tools':
            await deleteMessage(chatId, messageId);
            await sendToolsMessage(chatId);
            break;
    }

    return new Response('OK');
}

// Send Welcome Message
async function sendWelcomeMessage(chatId, user) {
    const videoUrl = "https://t.me/kajal_developer/57";
    const caption = `<b>👋 Welcome Back ${user.first_name}</b>\n\n🌥️ Bot Status: Alive 🟢\n\n💞 Dev: @LakshayDied`;
    
    const buttons = [
        [{ text: "Commands", callback_data: "/Commands" }],
        [{ text: "DEV", url: "https://t.me/Teleservices_Api" }]
    ];

    await sendVideo(chatId, videoUrl, caption, buttons);
}

// Send Commands Menu
async function sendCommandsMenu(chatId) {
    const videoUrl = "https://t.me/kajal_developer/57";
    const caption = `<b>[𖤐] XS Developer :</b>\n\n<b>[ϟ] Current Gateways And Tools :</b>\n\n<b>[ᛟ] Charge - 0</b>\n<b>[ᛟ] Auth - 0</b>\n<b>[ᛟ] Tools - 2</b>`;
    
    const buttons = [
        [
            { text: "Gateways", callback_data: "/black" },
            { text: "Tools", callback_data: "/tools" }
        ],
        [
            { text: "Channel", url: "https://t.me/Teleservices_Api" },
            { text: "DEV", url: "https://t.me/Teleservices_Bots" }
        ],
        [{ text: "◀️ Go Back", callback_data: "/black" }]
    ];

    await sendVideo(chatId, videoUrl, caption, buttons);
}

// Send About Message
async function sendAboutMessage(chatId, user) {
    const aboutMessage = `
<b><blockquote>⍟───[ MY DETAILS ]───⍟</blockquote>

‣ My Name: <a href="https://t.me/${user.username}">${user.first_name}</a>
‣ Best Friend: <a href='tg://settings'>This Person</a> 
‣ Developer: <a href='https://t.me/kingvj01'>Tech VJ</a> 
‣ Library: JavaScript
‣ Language: Node.js 
‣ Database: Cloudflare KV 
‣ Bot Server: Cloudflare Workers 
‣ Build Status: Stable</b>`;

    await sendMessage(chatId, aboutMessage);
}

// Send Video Helper Function
async function sendVideo(chatId, video, caption, buttons) {
    await fetch(`${BASE_URL}/sendVideo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            video: video,
            caption: caption,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: buttons }
        })
    });
}

// Send Message Helper Function
async function sendMessage(chatId, text) {
    await fetch(`${BASE_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });
}

// Delete Message
async function deleteMessage(chatId, messageId) {
    await fetch(`${BASE_URL}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId
        })
    });
}
