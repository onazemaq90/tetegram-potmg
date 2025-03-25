const TELEGRAM_BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';
const TELEGRAM_CHANNEL_ID = '-1002336355456'; // Channel username or ID
const API_URL = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN;

const progressBars = [
    "▱▱▱▱▱▱▱▱▱▱",
    "▰▱▱▱▱▱▱▱▱▱",
    "▰▰▱▱▱▱▱▱▱▱",
    "▰▰▰▱▱▱▱▱▱▱",
    "▰▰▰▰▱▱▱▱▱▱",
    "▰▰▰▰▰▱▱▱▱▱",
    "▰▰▰▰▰▰▱▱▱▱",
    "▰▰▰▰▰▰▰▱▱▱",
    "▰▰▰▰▰▰▰▰▱▱",
    "▰▰▰▰▰▰▰▰▰▱",
    "▰▰▰▰▰▰▰▰▰▰"
];

async function sendMessage(chatId, text, replyToMessageId = null) {
    const payload = {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
    };
    
    if (replyToMessageId) {
        payload.reply_to_message_id = replyToMessageId;
    }
    
    const response = await fetch(API_URL + '/sendMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    return response.json();
}

async function forwardMessage(chatId, fromChatId, messageId) {
    const response = await fetch(API_URL + '/forwardMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            from_chat_id: fromChatId,
            message_id: messageId
        })
    });
    
    return response.json();
}

async function getIpInfo(ip) {
    // Simulate progress
    for (let i = 0; i <= 10; i++) {
        const progressText = `╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressBars[i]} ${i*10}%
⏳ Please wait...`;
        
        // In a real implementation, you would edit the same message
        // For simplicity, we're just sending new messages here
        await sendMessage(chatId, progressText);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Actual IP lookup (using ipinfo.io as example)
    const response = await fetch(`https://ipinfo.io/${ip}/json`);
    const data = await response.json();
    
    return data;
}

async function handleRequest(request) {
    if (request.method === 'POST') {
        const update = await request.json();
        
        if (update.message) {
            const message = update.message;
            const chatId = message.chat.id;
            const text = message.text || '';
            
            // Forward message to channel
            if (text && !text.startsWith('/')) {
                await forwardMessage(TELEGRAM_CHANNEL_ID, chatId, message.message_id);
            }
            
            if (text.startsWith('/start')) {
                const welcomeMessage = `Welcome to IP Info Bot! Send me an IP address to check.`;
                return new Response(JSON.stringify(await sendMessage(chatId, welcomeMessage)));
            }
            else if (text.startsWith('/ip ')) {
                const ip = text.split(' ')[1];
                if (ip) {
                    // Send initial progress message
                    const initialProgress = `╔═══════════════════╗
║ 🔍 𝐒𝐜𝐚𝐧𝐧𝐢𝐧𝐠 𝐈𝐏... ║
╚═══════════════════╝
🔰 Progress: ${progressBars[0]} 0%
⏳ Please wait...`;
                    
                    const sentMessage = await sendMessage(chatId, initialProgress);
                    
                    // Get IP info with progress updates
                    const ipInfo = await getIpInfo(ip);
                    
                    // Format results
                    const resultText = `🛡️ IP Information:
                    
📍 IP: ${ipInfo.ip || 'N/A'}
🌍 Country: ${ipInfo.country || 'N/A'}
🏙️ City: ${ipInfo.city || 'N/A'}
🏢 Region: ${ipInfo.region || 'N/A'}
📌 Postal: ${ipInfo.postal || 'N/A'}
🕸️ Hostname: ${ipInfo.hostname || 'N/A'}
📡 ISP: ${ipInfo.org || 'N/A'}`;
                    
                    // Send final result
                    await sendMessage(chatId, resultText);
                    
                    return new Response(JSON.stringify({ status: 'success' }));
                } else {
                    return new Response(JSON.stringify(await sendMessage(chatId, 'Please provide an IP address after /ip')));
                }
            }
        }
    }
    
    return new Response('OK');
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
