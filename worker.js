const TELEGRAM_TOKEN = '7286429810:AAHBzO7SFy6AjYv8avTRKWQg53CJpD2KEbM';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// In-memory stores
let servedChats = new Set();
// Super admin ID (replace with your Telegram user ID)
const SUPER_ADMIN_ID = '6490007953'; // e.g., 123456789
// Admin list with privileges (in-memory, replace with persistent storage in production)
let admins = new Map([
    [SUPER_ADMIN_ID, { canBroadcast: true, canReload: true }]
]);

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
            const { text, chat, from: user, reply_to_message, message_id } = update.message;
            const chatId = chat.id;

            // Add chat to servedChats
            servedChats.add(chatId);

            switch (text?.split(' ')[0]) {
                case '/start':
                    await sendWelcomeMessage(chatId, user);
                    break;
                case '/Commands':
                    await deleteMessage(chatId, message_id);
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
                case '/broadcast':
                    if (!admins.has(user.id.toString()) || !admins.get(user.id.toString()).canBroadcast) {
                        await telegramApi('sendMessage', {
                            chat_id: chatId,
                            text: '<b>⚠️ Access Denied: Only admins with broadcast privileges can use this.</b>',
                            parse_mode: 'HTML'
                        });
                    } else {
                        await handleBroadcast(chatId, user, text, reply_to_message);
                    }
                    break;
                case '/close':
                    await deleteMessage(chatId, message_id);
                    break;
                case '/reload':
                    if (user.id.toString() !== SUPER_ADMIN_ID) {
                        await telegramApi('sendMessage', {
                            chat_id: chatId,
                            text: '<b>⚠️ Access Denied: Only the super admin can reload.</b>',
                            parse_mode: 'HTML'
                        });
                    } else {
                        await handleReload(chatId, user);
                    }
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

async function sendPing(chatId) {
    const startTime = performance.now();
    const pingMessage = await telegramApi('sendMessage', {
        chat_id: chatId,
        text: '<b>🏓 Pinging...</b>',
        parse_mode: 'HTML'
    });

    if (!pingMessage || !pingMessage.result) return;

    const endTime = performance.now();
    const timeTakenMs = (endTime - startTime).toFixed(3);

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

async function handleBroadcast(chatId, user, text, replyToMessage) {
    let broadcastMessage;

    if (replyToMessage) {
        broadcastMessage = replyToMessage.text || replyToMessage.caption || 'Media message';
    } else {
        const messageContent = text.replace('/broadcast', '').trim();
        if (!messageContent) {
            await telegramApi('sendMessage', {
                chat_id: chatId,
                text: '<b>⚠️ Please provide a message or reply to one to broadcast!</b>',
                parse_mode: 'HTML'
            });
            return;
        }
        broadcastMessage = messageContent;
    }

    const statusMessage = await telegramApi('sendMessage', {
        chat_id: chatId,
        text: '<b>📢 Broadcasting...</b>',
        parse_mode: 'HTML'
    });

    if (!statusMessage || !statusMessage.result) return;

    let sentCount = 0;
    let failedCount = 0;

    for (const targetChatId of servedChats) {
        if (targetChatId === chatId) continue;
        const result = await telegramApi('sendMessage', {
            chat_id: targetChatId,
            text: broadcastMessage,
            parse_mode: 'HTML'
        });
        if (result) sentCount++;
        else failedCount++;
    }

    const broadcastResult = `
<b>📢 Broadcast Complete 🌐</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>Message:</b> <i>${broadcastMessage}</i>
➻ <b>Sent:</b> <code>${sentCount}</code> chats
➻ <b>Failed:</b> <code>${failedCount}</code> chats
➻ <b>Total Chats:</b> <code>${servedChats.size}</code>
<i>Admin: @${user.username || 'Unknown'} | Powered by xAI</i>
    `;

    await telegramApi('editMessageText', {
        chat_id: chatId,
        message_id: statusMessage.result.message_id,
        text: broadcastResult,
        parse_mode: 'HTML'
    });
}

// New /reload command
async function handleReload(chatId, user) {
    // Simulate reloading admin list (replace with actual logic for your source)
    const updatedAdmins = new Map([
        [SUPER_ADMIN_ID, { canBroadcast: true, canReload: true }], // Super admin retains all privileges
        ['SECOND_ADMIN_ID', { canBroadcast: true, canReload: false }], // Example additional admin
        ['THIRD_ADMIN_ID', { canBroadcast: false, canReload: false }]  // Example with limited privileges
    ]);

    admins = updatedAdmins; // Update the global admins list

    // Send stylish confirmation
    const reloadMessage = await telegramApi('sendMessage', {
        chat_id: chatId,
        text: '<b>🔄 Reloading Admin List...</b>',
        parse_mode: 'HTML'
    });

    if (!reloadMessage || !reloadMessage.result) return;

    const reloadResult = `
<b>🔄 Admin Reload Complete ⚡</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>Total Admins:</b> <code>${admins.size}</code>
➻ <b>Super Admin:</b> <code>${SUPER_ADMIN_ID}</code>
➻ <b>Privileges Updated:</b> ✅
<i>Reloaded by @${user.username || 'Unknown'} | Powered by xAI</i>
    `;

    await telegramApi('editMessageText', {
        chat_id: chatId,
        message_id: reloadMessage.result.message_id,
        text: reloadResult,
        parse_mode: 'HTML'
    });
}

// Event listener for fetch
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
