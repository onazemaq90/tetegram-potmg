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
        [{ text: '👨‍💻 DEV', url: 'https://t.me/Teleservices_Api' }]
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
        [{ text: '◀️ Go Back', callback_data: '/black' }]
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

// New /id command function
async function sendUserProfile(chatId, user) {
    const userId = user.id;
    const firstName = user.first_name;
    const username = user.username ? `@${user.username}` : 'N/A';
    const link = user.username ? `https://t.me/${user.username}` : 'No public link';
    const presence = user.is_bot ? 'Bot' : 'Online'; // Simplified presence check
    const healthPercentage = Math.floor(Math.random() * 101); // Random health for demo
    const healthBar = generateHealthBar(healthPercentage);
    const commonChats = 'Unknown'; // Could be fetched via API if needed
    const blacklisted = 'No';
    const malicious = 'No';

    const profileMessage = `
<b>✦ ᴜsᴇʀ ɪɴғᴏ ✦</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>ᴜsᴇʀ ɪᴅ:</b> <code>${userId}</code>
➻ <b>ғɪʀsᴛ ɴᴀᴍᴇ:</b> ${firstName}
➻ <b>ᴜsᴇʀɴᴀᴍᴇ:</b> ${username}
➻ <b>ʟɪɴᴋ:</b> <a href="${link}">${link}</a>
➻ <b>ᴩʀᴇsᴇɴᴄᴇ:</b> ${presence}

<b>ʜᴇᴀʟᴛʜ:</b> ${healthPercentage}/100
${healthBar}

➻ <b>ᴄᴏᴍᴍᴏɴ ᴄʜᴀᴛs:</b> ${commonChats}

<b>Blacklisted:</b> ${blacklisted}
<b>Malicious:</b> ${malicious}
    `;

    await telegramApi('sendMessage', {
        chat_id: chatId,
        text: profileMessage,
        parse_mode: 'HTML'
    });
}

// Helper function to generate health bar
function generateHealthBar(percentage) {
    const totalBlocks = 10;
    const filledBlocks = Math.round((percentage / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    return `[${'■'.repeat(filledBlocks)}${'□'.repeat(emptyBlocks)} ${percentage}%]`;
}

async function deleteMessage(chatId, messageId) {
    await telegramApi('deleteMessage', {
        chat_id: chatId,
        message_id: messageId
    });
}

// Event listener for fetch
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
