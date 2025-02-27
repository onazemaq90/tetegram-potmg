const TELEGRAM_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const PINTEREST_REGEX = /https?:\/\/(?:www\.)?pinterest\.(?:com|it|fr|de|es|co\.uk|ca|au|nz|jp|ru|com\.mx|com\.br|co|at|ch|dk|fi|ie|nl|no|pt|se|co\.in|co\.kr|co\.th|co\.id|com\.ph|vn|com\.tr|com\.sa|com\.eg|com\.vn|com\.my|com\.sg|com\.tw|be|co\.za|co\.il)\/[^ ]+/i;

const PROGRESS_TEMPLATE = (progress, name, size, speed, time) => 
`╭━━━━❰ Bot Renaming... ❱━➣
┣⪼ 🗂️ : ${name} | ${size}
┣⪼ ⏳️ : ${progress}%
┣⪼ 🚀 : ${speed}/s
┣⪼ ⏱️ : ${time}
╰━━━━━━━━━━━━━━━➣`;

async function handleRequest(request) {
    if (request.method === 'POST') {
        const update = await request.json();
        const chatId = update.message.chat.id;
        const text = update.message.text || '';
        
        // Handle /start command
        if (text.startsWith('/start')) {
            const startMessage = `🌟 Welcome to Pinterest Downloader Bot!\nSend me a Pinterest link to get started.`;
            await sendTelegramMessage(chatId, startMessage);
            return new Response('OK');
        }

        // Handle Pinterest URLs
        const pinterestUrl = text.match(PINTEREST_REGEX);
        if (pinterestUrl) {
            await sendProgressUpdates(chatId, pinterestUrl[0]);
            return new Response('OK');
        }

        await sendTelegramMessage(chatId, '❌ Invalid link. Please send a valid Pinterest URL.');
    }
    return new Response('OK');
}

async function sendProgressUpdates(chatId, url) {
    try {
        // Send initial progress message
        const progressMessage = await sendTelegramMessage(chatId, 
            PROGRESS_TEMPLATE(0, 'Initializing...', '0 MB', '0 KB', '0s'));

        // Fetch Pinterest content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = await response.text();
        const mediaUrl = extractMediaUrl(html);
        
        // Update progress
        await editTelegramMessage(chatId, progressMessage.result.message_id,
            PROGRESS_TEMPLATE(50, 'Downloading...', '5 MB', '1.2 MB', '10s'));
        
        // Send media
        await sendTelegramMedia(chatId, mediaUrl);
        
        // Final update
        await editTelegramMessage(chatId, progressMessage.result.message_id,
            PROGRESS_TEMPLATE(100, 'Complete!', '10 MB', '1.5 MB', '15s'));

    } catch (error) {
        await sendTelegramMessage(chatId, `❌ Error: ${error.message}`);
    }
}

function extractMediaUrl(html) {
    const videoRegex = /"video_src":"(https?:\/\/[^"]+\.mp4)"/;
    const imageRegex = /"image_src":"(https?:\/\/[^"]+\.jpg)"/;
    
    const videoMatch = html.match(videoRegex);
    if (videoMatch) return videoMatch[1];
    
    const imageMatch = html.match(imageRegex);
    if (imageMatch) return imageMatch[1];
    
    throw new Error('No media found');
}

async function sendTelegramMessage(chatId, text) {
    return fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });
}

async function editTelegramMessage(chatId, messageId, text) {
    return fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML'
        })
    });
}

async function sendTelegramMedia(chatId, mediaUrl) {
    const isVideo = mediaUrl.endsWith('.mp4');
    const method = isVideo ? 'sendVideo' : 'sendPhoto';
    
    return fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            [isVideo ? 'video' : 'photo']: mediaUrl
        })
    });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
