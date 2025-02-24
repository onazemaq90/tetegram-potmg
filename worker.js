const TELEGRAM_TOKEN = '7286429810:AAHBzO7SFy6AjYv8avTRKWQg53CJpD2KEbM';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Utility function for Telegram API calls
async function telegramApi(method, payload) {
    try {
        const response = await fetch(`${BASE_URL}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Telegram API error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error in ${method}:`, error);
        return null;
    }
}

// Main request handler
async function handleRequest(request) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    const update = await request.json();
    return (await handleUpdate(update)) ? new Response('OK') : new Response('Error', { status: 500 });
}

// Update handler
async function handleUpdate(update) {
    try {
        if (update.callback_query) {
            const { data, message } = update.callback_query;
            const chatId = message.chat.id;
            const messageId = message.message_id;

            switch (data) {
                case '/Commands':
                    await deleteMessage(chatId, messageId);
                    await sendCommandsMenu(chatId);
                    break;
                case '/goBack':
                    await deleteMessage(chatId, messageId);
                    await sendWelcomeMessage(chatId, { id: chatId, first_name: 'User' });
                    break;
            }
            return true;
        }

        if (update.message) {
            const { text, chat, from: user } = update.message;
            const chatId = chat.id;

            switch (text) {
                case '/start':
                    await sendWelcomeMessage(chatId, user);
                    break;
                case '/Commands':
                    await deleteMessage(chatId, update.message.message_id);
                    await sendCommandsMenu(chatId);
                    break;
                case '/about':
                    await sendAboutMessage(chatId, user);
                    break;
                case '/id':
                    await sendUserProfile(chatId, user);
                    break;
                case '/ping':
                    await sendPing(chatId);
                    break;
                default:
                    await sendDefaultMessage(chatId);
            }
            return true;
        }
        return true;
    } catch (error) {
        console.error('Update handling error:', error);
        return false;
    }
}

// Message sending functions
async function sendWelcomeMessage(chatId, user) {
    const videoUrl = 'https://t.me/kajal_developer/57';
    const buttons = [
        [{ text: '💻 Commands', callback_data: '/Commands' }],
        [{ text: '👨‍💻 DEV', url: 'https://t.me/Teleservices_Api' }],
        [{ text: '◀️ Go Back', callback_data: '/goBack' }]
    ];
    const caption = `<b>👋 Welcome Back, ${user.first_name}!</b>\n\n🌟 Bot Status: Alive 🟢\n💞 Dev: @LakshayDied`;

    await telegramApi('sendVideo', {
        chat_id: chatId,
        video: videoUrl,
        caption,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
    });
}

async function sendCommandsMenu(chatId) {
    const videoUrl = 'https://t.me/kajal_developer/57';
    const buttons = [
        [
            { text: '🔗 Gateways', callback_data: '/black' },
            { text: '🛠️ Tools', callback_data: '/tools' }
        ],
        [
            { text: '📢 Channel', url: 'https://t.me/Teleservices_Api' },
            { text: '👨‍💻 DEV', url: 'https://t.me/Teleservices_Bots' }
        ],
        [{ text: '◀️ Go Back', callback_data: '/goBack' }]
    ];
    const caption = `<b>[𖤐] XS Developer:</b>\n\n<b>[ϟ] Current Gateways & Tools:</b>\n<b>[ᛟ] Charge: 0</b>\n<b>[ᛟ] Auth: 0</b>\n<b>[ᛟ] Tools: 2</b>`;

    await telegramApi('sendVideo', {
        chat_id: chatId,
        video: videoUrl,
        caption,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
    });
}

async function sendAboutMessage(chatId, user) {
    const aboutMessage = `<b><blockquote>⍟───[ MY DETAILS ]───⍟</blockquote></b>
‣ Name: <a href="https://t.me/${user.username || ''}">${user.first_name}</a>
‣ Best Friend: <a href="tg://settings">This Person</a>
‣ Developer: <a href="https://t.me/kingvj01">Tech VJ</a>
‣ Build Status: <b>v [Stable]</b>`;

    await telegramApi('sendMessage', {
        chat_id: chatId,
        text: aboutMessage,
        parse_mode: 'HTML'
    });
}

async function sendDefaultMessage(chatId) {
    await telegramApi('sendMessage', {
        chat_id: chatId,
        text: '<b>⚡ Use /Commands to see available options!</b>',
        parse_mode: 'HTML'
    });
}

async function deleteMessage(chatId, messageId) {
    await telegramApi('deleteMessage', {
        chat_id: chatId,
        message_id: messageId
    });
}

async function sendUserProfile(chatId, user) {
    const userId = user.id;
    const userName = user.first_name;
    const username = user.username ? `@${user.username}` : 'Not set';
    const userLink = user.username ? `https://t.me/${user.username}` : 'No public link';

    const profilePhotos = await telegramApi('getUserProfilePhotos', {
        user_id: userId,
        limit: 1
    });

    if (profilePhotos && profilePhotos.result.total_count > 0) {
        const photoId = profilePhotos.result.photos[0][0].file_id;
        const caption = `
<b>✦ ᴜsᴇʀ ɪɴғᴏ ✦</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>User ID:</b> <code>${userId}</code>
➻ <b>First Name:</b> ${userName}
➻ <b>Username:</b> ${username}
➻ <b>Link:</b> <a href="${userLink}">${userLink}</a>
➻ <b>Presence:</b> Online (Static)

<b>Health:</b> 100%
[■■■■■■■■■■] 

➻ <b>Common Chats:</b> Unknown
➻ <b>Blacklisted:</b> No
➻ <b>Malicious:</b> No
<i>Code by @Teleservice_Assistant_bot</i>
        `;

        await telegramApi('sendPhoto', {
            chat_id: chatId,
            photo: photoId,
            caption,
            parse_mode: 'HTML'
        });
    } else {
        const text = `
<b>✦ ᴜsᴇʀ ɪɴғᴏ ✦</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>User ID:</b> <code>${userId}</code>
➻ <b>First Name:</b> ${userName}
➻ <b>Username:</b> ${username}
➻ <b>Link:</b> <a href="${userLink}">${userLink}</a>
➻ <b>Presence:</b> Online (Static)

<b>Health:</b> 100%
[■■■■■■■■■■] 

➻ <b>Common Chats:</b> Unknown
➻ <b>Blacklisted:</b> No
➻ <b>Malicious:</b> No
<i>No profile photo found. Code by @Teleservice_Assistant_bot</i>
        `;

        await telegramApi('sendMessage', {
            chat_id: chatId,
            text,
            parse_mode: 'HTML'
        });
    }
}

// New /ping command with stylish design
async function sendPing(chatId) {
    const startTime = performance.now(); // High-precision timing

    // Send initial "Pinging..." message
    const pingMessage = await telegramApi('sendMessage', {
        chat_id: chatId,
        text: '<b>🏓 Pinging...</b>',
        parse_mode: 'HTML'
    });

    if (!pingMessage || !pingMessage.result) return;

    const endTime = performance.now();
    const timeTakenMs = (endTime - startTime).toFixed(3); // Time in milliseconds

    // Edit the message with a stylish ping response
    const pingText = `
<b>🏓 Ping Results 🔥</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>Response Time:</b> <code>${timeTakenMs} ms</code>
➻ <b>Status:</b> ${timeTakenMs < 100 ? '⚡ Lightning Fast' : timeTakenMs < 300 ? '🌟 Good' : '🐢 Slow'}
➻ <b>Bot Health:</b> Alive 🟢
<i>Powered by xAI Tech</i>
    `;

    await telegramApi('editMessageText', {
        chat_id: chatId,
        message_id: pingMessage.result.message_id,
        text: pingText,
        parse_mode: 'HTML'
    });
}

// Event listener for fetch
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
