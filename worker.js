const TELEGRAM_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// In-memory stores
let servedChats = new Set();
let groupSettings = new Map();
const SUPER_ADMIN_ID = '6490007953'; // Replace with your Telegram ID
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
            const { data, message, from } = update.callback_query;
            const chatId = message.chat.id;
            const messageId = message.message_id;

            if (data.startsWith('/settings_')) {
                await handleSettingsCallback(chatId, messageId, from.id, data);
                return true;
            }

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
                        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ Access Denied: Only admins with broadcast privileges can use this.</b>', parse_mode: 'HTML' });
                    } else {
                        await handleBroadcast(chatId, user, text, reply_to_message);
                    }
                    break;
                case '/close':
                    await deleteMessage(chatId, message_id);
                    break;
                case '/reload':
                    if (user.id.toString() !== SUPER_ADMIN_ID) {
                        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ Access Denied: Only the super admin can reload.</b>', parse_mode: 'HTML' });
                    } else {
                        await handleReload(chatId, user);
                    }
                    break;
                case '/settings':
                    await handleSettings(chatId, user, message_id);
                    break;
                case '/ban':
                    await handleBan(chatId, user, reply_to_message, message_id);
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
    const settings = groupSettings.get(chatId.toString()) || { welcomeEnabled: true, language: 'en' };
    if (chatId < 0 && !settings.welcomeEnabled) return;

    const videoUrl = 'https://t.me/kajal_developer/57';
    const buttons = [
        [{ text: '💻 Commands', callback_data: '/Commands' }],
        [{ text: '👨‍💻 DEV', url: 'https://t.me/Teleservices_Api' }],
        [{ text: '🔄', callback_data: '/update' }]
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

    await telegramApi('sendMessage', { chat_id: chatId, text: aboutMessage, parse_mode: 'HTML' });
}

async function sendDefaultMessage(chatId) {
    await telegramApi('sendMessage', {
        chat_id: chatId,
        text: '<b>⚡ Use /Commands to see available options!</b>',
        parse_mode: 'HTML'
    });
}

async function deleteMessage(chatId, messageId) {
    await telegramApi('deleteMessage', { chat_id: chatId, message_id: messageId });
}

async function sendUserProfile(chatId, user) {
    const userId = user.id;
    const userName = user.first_name;
    const username = user.username ? `@${user.username}` : 'Not set';
    const userLink = user.username ? `https://t.me/${user.username}` : 'No public link';

    const profilePhotos = await telegramApi('getUserProfilePhotos', { user_id: userId, limit: 1 });
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
<b>Health:</b> 100% [■■■■■■■■■■]
➻ <b>Common Chats:</b> Unknown
➻ <b>Blacklisted:</b> No
➻ <b>Malicious:</b> No
<i>Code by @Teleservice_Assistant_bot</i>
        `;
        await telegramApi('sendPhoto', { chat_id: chatId, photo: photoId, caption, parse_mode: 'HTML' });
    } else {
        const text = `
<b>✦ ᴜsᴇʀ ɪɴғᴏ ✦</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>User ID:</b> <code>${userId}</code>
➻ <b>First Name:</b> ${userName}
➻ <b>Username:</b> ${username}
➻ <b>Link:</b> <a href="${userLink}">${userLink}</a>
➻ <b>Presence:</b> Online (Static)
<b>Health:</b> 100% [■■■■■■■■■■]
➻ <b>Common Chats:</b> Unknown
➻ <b>Blacklisted:</b> No
➻ <b>Malicious:</b> No
<i>No profile photo found. Code by @Teleservice_Assistant_bot</i>
        `;
        await telegramApi('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' });
    }
}

async function sendPing(chatId) {
    const animationFrames = ['💫', '✨', '⭐', '🌟'];
    const startTime = performance.now();
    
    // Send initial animated ping message
    let pingMessage;
    for (const frame of animationFrames) {
        pingMessage = await telegramApi('sendMessage', {
            chat_id: chatId,
            text: `<b>${frame}</b>`,
            parse_mode: 'HTML'
        });
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!pingMessage?.result) return;

    const endTime = performance.now();
    const timeTakenMs = (endTime - startTime).toFixed(3);
    const photoUrl = "https://t.me/kajal_developer/59";
    
    const caption = `
<b>🎯 𝐏𝐢𝐧𝐠 𝐀𝐧𝐚𝐥𝐲𝐬𝐢𝐬 🚀</b>

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
    
🕒 <b>𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞 𝐓𝐢𝐦𝐞:</b> <code>${timeTakenMs} 𝐦𝐬</code>
📈 <b>𝐏𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞:</b> ${getPerformanceIcon(timeTakenMs)}
⚡ <b>𝐒𝐭𝐚𝐭𝐮𝐬:</b> ${getStatusText(timeTakenMs)}
🟢 <b>𝐁𝐨𝐭 𝐒𝐭𝐚𝐭𝐮𝐬:</b> <ins>𝐎𝐩𝐞𝐫𝐚𝐭𝐢𝐨𝐧𝐚𝐥</ins>

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

<i>𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗫𝗔𝗜 𝗧𝗲𝗰𝗵𝗻𝗼𝗹𝗼𝗴𝗶𝗲𝘀</i>`.trim();

    // Edit with final polished design
    await telegramApi('editMessageMedia', {
        chat_id: chatId,
        message_id: pingMessage.result.message_id,
        media: {
            type: 'photo',
            media: photoUrl,
            caption: caption,
            parse_mode: 'HTML'
        }
    });

    // Add status emoji reaction
    await telegramApi('setMessageReaction', {
        chat_id: chatId,
        message_id: pingMessage.result.message_id,
        reaction: [{
            type: 'emoji',
            emoji: timeTakenMs < 100 ? '🚀' : timeTakenMs < 300 ? '⏱️' : '📉'
        }]
    });
}

function getStatusText(time) {
    if (time < 100) return '𝐋𝐢𝐠𝐡𝐭𝐧𝐢𝐧𝐠 𝐒𝐩𝐞𝐞𝐝 🚀';
    if (time < 300) return '𝐎𝐩𝐭𝐢𝐦𝐚𝐥 𝐏𝐞𝐫𝐟𝐨𝐫𝐦𝐚𝐧𝐜𝐞 ⚡';
    return '𝐑𝐞𝐬𝐨𝐮𝐫𝐜𝐞 𝐂𝐨𝐧𝐬𝐭𝐫𝐚𝐢𝐧𝐭𝐬 🐢';
}

function getPerformanceIcon(time) {
    if (time < 100) return '🎯';
    if (time < 200) return '🏅';
    if (time < 300) return '🎖️';
    return '⚠️';
}

async function handleBroadcast(chatId, user, text, replyToMessage) {
    let broadcastMessage;
    if (replyToMessage) {
        broadcastMessage = replyToMessage.text || replyToMessage.caption || 'Media message';
    } else {
        const messageContent = text.replace('/broadcast', '').trim();
        if (!messageContent) {
            await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ Please provide a message or reply to one to broadcast!</b>', parse_mode: 'HTML' });
            return;
        }
        broadcastMessage = messageContent;
    }

    const statusMessage = await telegramApi('sendMessage', { chat_id: chatId, text: '<b>📢 Broadcasting...</b>', parse_mode: 'HTML' });
    if (!statusMessage || !statusMessage.result) return;

    let sentCount = 0, failedCount = 0;
    for (const targetChatId of servedChats) {
        if (targetChatId === chatId) continue;
        const result = await telegramApi('sendMessage', { chat_id: targetChatId, text: broadcastMessage, parse_mode: 'HTML' });
        if (result) sentCount++; else failedCount++;
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

async function handleReload(chatId, user) {
    const updatedAdmins = new Map([
        [SUPER_ADMIN_ID, { canBroadcast: true, canReload: true }],
        ['SECOND_ADMIN_ID', { canBroadcast: true, canReload: false }],
        ['THIRD_ADMIN_ID', { canBroadcast: false, canReload: false }]
    ]);
    admins = updatedAdmins;

    const reloadMessage = await telegramApi('sendMessage', { chat_id: chatId, text: '<b>🔄 Reloading Admin List...</b>', parse_mode: 'HTML' });
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

async function handleSettings(chatId, user, messageId) {
    if (chatId > 0) {
        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ /settings is only available in groups!</b>', parse_mode: 'HTML' });
        return;
    }

    const member = await telegramApi('getChatMember', { chat_id: chatId, user_id: user.id });
    if (!member || !['administrator', 'creator'].includes(member.result.status)) {
        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ Only group admins can use /settings!</b>', parse_mode: 'HTML' });
        return;
    }

    const settings = groupSettings.get(chatId.toString()) || { welcomeEnabled: true, language: 'en' };
    groupSettings.set(chatId.toString(), settings);

    const buttons = [
        [
            { text: `Welcome Msg: ${settings.welcomeEnabled ? '✅ On' : '❌ Off'}`, callback_data: '/settings_toggleWelcome' },
            { text: `Language: ${settings.language.toUpperCase()}`, callback_data: '/settings_changeLanguage' }
        ],
        [{ text: 'Close', callback_data: '/closeSettings' }]
    ];

    const settingsText = `
<b>⚙️ Group Settings ⚙️</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>Chat ID:</b> <code>${chatId}</code>
➻ <b>Welcome Msg:</b> ${settings.welcomeEnabled ? 'Enabled' : 'Disabled'}
➻ <b>Language:</b> ${settings.language.toUpperCase()}
<i>Manage bot settings for this group | Powered by xAI</i>
    `;
    await telegramApi('sendMessage', { chat_id: chatId, text: settingsText, parse_mode: 'HTML', reply_markup: { inline_keyboard: buttons } });
    await deleteMessage(chatId, messageId);
}

async function handleSettingsCallback(chatId, messageId, userId, data) {
    const member = await telegramApi('getChatMember', { chat_id: chatId, user_id: userId });
    if (!member || !['administrator', 'creator'].includes(member.result.status)) {
        await telegramApi('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: '<b>⚠️ Only group admins can modify settings!</b>',
            parse_mode: 'HTML'
        });
        return;
    }

    const settings = groupSettings.get(chatId.toString()) || { welcomeEnabled: true, language: 'en' };

    switch (data) {
        case '/settings_toggleWelcome':
            settings.welcomeEnabled = !settings.welcomeEnabled;
            break;
        case '/settings_changeLanguage':
            settings.language = settings.language === 'en' ? 'es' : 'en';
            break;
        case '/closeSettings':
            await deleteMessage(chatId, messageId);
            return;
    }

    groupSettings.set(chatId.toString(), settings);

    const buttons = [
        [
            { text: `Welcome Msg: ${settings.welcomeEnabled ? '✅ On' : '❌ Off'}`, callback_data: '/settings_toggleWelcome' },
            { text: `Language: ${settings.language.toUpperCase()}`, callback_data: '/settings_changeLanguage' }
        ],
        [{ text: 'Close', callback_data: '/closeSettings' }]
    ];

    const updatedText = `
<b>⚙️ Group Settings ⚙️</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>Chat ID:</b> <code>${chatId}</code>
➻ <b>Welcome Msg:</b> ${settings.welcomeEnabled ? 'Enabled' : 'Disabled'}
➻ <b>Language:</b> ${settings.language.toUpperCase()}
<i>Settings updated | Powered by xAI</i>
    `;
    await telegramApi('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: updatedText,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: buttons }
    });
}

// New /ban command
async function handleBan(chatId, user, replyToMessage, messageId) {
    // Check if it's a group
    if (chatId > 0) {
        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ /ban is only available in groups!</b>', parse_mode: 'HTML' });
        return;
    }

    // Check if user is an admin
    const member = await telegramApi('getChatMember', { chat_id: chatId, user_id: user.id });
    if (!member || !['administrator', 'creator'].includes(member.result.status)) {
        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ Only group admins can use /ban!</b>', parse_mode: 'HTML' });
        return;
    }

    // Check if there's a reply to ban a user
    if (!replyToMessage) {
        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ Please reply to a user’s message to ban them!</b>', parse_mode: 'HTML' });
        return;
    }

    const targetUser = replyToMessage.from;
    const targetUserId = targetUser.id;

    // Prevent banning admins or the bot itself
    const targetMember = await telegramApi('getChatMember', { chat_id: chatId, user_id: targetUserId });
    if (targetMember.result.status === 'administrator' || targetMember.result.status === 'creator') {
        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ Cannot ban group admins!</b>', parse_mode: 'HTML' });
        return;
    }
    if (targetUserId === (await telegramApi('getMe')).result.id) {
        await telegramApi('sendMessage', { chat_id: chatId, text: '<b>⚠️ I can’t ban myself!</b>', parse_mode: 'HTML' });
        return;
    }

    // Ban the user permanently
    const banResult = await telegramApi('banChatMember', {
        chat_id: chatId,
        user_id: targetUserId,
        revoke_messages: true, // Delete all messages from the user
        until_date: 0 // Permanent ban (0 = forever)
    });

    // Send stylish confirmation
    const banMessage = await telegramApi('sendMessage', {
        chat_id: chatId,
        text: `<b>🔨 Banning @${targetUser.username || targetUser.first_name}...</b>`,
        parse_mode: 'HTML'
    });

    if (!banMessage || !banMessage.result) return;

    const banText = `
<b>🔨 User Banned 🚫</b>
•❅─────✧❅✦❅✧─────❅•
➻ <b>User:</b> @${targetUser.username || targetUser.first_name} (<code>${targetUserId}</code>)
➻ <b>Status:</b> ${banResult.ok ? 'Permanently Banned' : 'Failed'}
➻ <b>Messages:</b> ${banResult.ok ? 'Deleted' : 'Not Deleted'}
<i>Banned by @${user.username || user.first_name} | Powered by xAI</i>
    `;

    await telegramApi('editMessageText', {
        chat_id: chatId,
        message_id: banMessage.result.message_id,
        text: banText,
        parse_mode: 'HTML'
    });

    // Delete the /ban command message
    await deleteMessage(chatId, messageId);
}

// Event listener for fetch
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
          
