// cloudflare-worker.js
const TELEGRAM_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Helper function to validate BIN
function isValidBin(binNumber) {
    return /^\d{6,}$/.test(binNumber);
}

// Luhn algorithm implementation
function generateCard(binPrefix, length = 16) {
    let cardNumber = binPrefix;
    while (cardNumber.length < length - 1) {
        cardNumber += Math.floor(Math.random() * 10);
    }

    const digits = cardNumber.split('').map(Number);
    const oddDigits = digits.reverse().filter((_, idx) => idx % 2 === 0);
    const evenDigits = digits.reverse().filter((_, idx) => idx % 2 === 1);

    let total = oddDigits.reduce((acc, val) => acc + val, 0);
    total += evenDigits.reduce((acc, val) => {
        const doubled = val * 2;
        return acc + (doubled > 9 ? doubled - 9 : doubled);
    }, 0);

    const checkDigit = (10 - (total % 10)) % 10;
    return cardNumber + checkDigit.toString();
}

// Generate card details
function generateCardDetails() {
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const year = String(Math.floor(Math.random() * 5) + Number(currentYear) + 1);
    const cvv = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
    return { month, year, cvv };
}

// Generate BIN information
async function getBinInfo(binNumber) {
    try {
        const response = await fetch(`https://lookup.binlist.net/${binNumber}`, {
            headers: { 'Accept-Version': '3' }
        });
        
        if (response.ok) {
            const data = await response.json();
            return {
                brand: data.scheme?.toUpperCase() || 'Unknown',
                type: data.type?.toUpperCase() || 'Unknown',
                bank: data.bank?.name || 'Unknown',
                country: data.country?.name || 'Unknown',
                emoji: data.country?.emoji || ''
            };
        }
        return null;
    } catch (error) {
        return null;
    }
}

// Handle Telegram messages
async function handleUpdate(request) {
    const update = await request.json();
    const message = update.message || update.channel_post;
    
    if (!message?.text) return new Response('OK');

    const text = message.text;
    const chatId = message.chat.id;

    // Handle start/help command
    if (text.startsWith('/start') || text.startsWith('/help')) {
        const welcomeText = `Welcome to CC Generator Bot!\\n\\nCommands:\\n/gen BIN or .gen BIN - Generate 15 credit cards\\nExample: /gen 446542\\n\\nGenerates valid Luhn-algorithm cards`;
        await sendMessage(chatId, welcomeText);
    }
    // Handle generate command
    else if (text.startsWith('/gen') || text.startsWith('.gen')) {
        const binNumber = text.split(' ')[1] || '';
        
        if (!isValidBin(binNumber)) {
            await sendMessage(chatId, 'Invalid BIN. Provide 6+ digit number');
            return new Response('OK');
        }

        const binInfo = await getBinInfo(binNumber.slice(0, 6));
        let binInfoText = binInfo ? 
            `🏦 BIN Info:\\n• Brand: ${binInfo.brand}\\n• Type: ${binInfo.type}\\n• Bank: ${binInfo.bank}\\n• Country: ${binInfo.country} ${binInfo.emoji}` : 
            '⚠️ BIN not found in database';

        const cards = Array.from({ length: 15 }, () => {
            const card = generateCard(binNumber.slice(0, 6));
            const { month, year, cvv } = generateCardDetails();
            return `${card}|${month}|${year}|${cvv}`;
        });

        const responseText = `••• CC GENERATOR\\n${binInfoText}\\n\\n${cards.join('\\n')}`;
        await sendMessage(chatId, responseText);
    }

    return new Response('OK');
}

// Send message through Telegram API
async function sendMessage(chatId, text) {
    const url = `${BASE_URL}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'MarkdownV2'
        })
    });
}

// Main worker handler
export default {
    async fetch(request, env) {
        if (request.method === 'POST') {
            return handleUpdate(request);
        }
        return new Response('Telegram Bot Running');
    }
};
