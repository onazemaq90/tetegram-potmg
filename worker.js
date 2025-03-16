const TELEGRAM_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4'; // Add your Telegram Bot Token
const MAIL_TM_API = 'https://api.mail.tm';

async function handleRequest(request) {
    const { message } = await request.json();

    if (!message || !message.text) return new Response('No message found');

    const chatId = message.chat.id;
    const text = message.text.trim();

    if (text === '/start') {
        await sendTelegramMessage(chatId, 
            "📧 Welcome to Mail.tm Bot!\n\nCommands:\n"
            + "`/create` — Generate a temporary email.\n"
            + "`/inbox` — Check inbox messages.\n"
            + "`/me` — Get email account details.\n"
            + "`/attachment <message_id> <attachment_id>` — Download email attachments."
        );
    } 
    else if (text === '/create') {
        const emailData = await createMailAccount();
        if (emailData && emailData.id) {
            await sendTelegramMessage(chatId, 
                `✅ **Temporary Email Created:**\n📩 Email: \`${emailData.address}\`\n🔑 Password: \`${emailData.password}\`\n\nUse \`/inbox\` to check messages.`
            );
        } else {
            await sendTelegramMessage(chatId, '❌ Failed to create an email. Try again later.');
        }
    } 
    else if (text.startsWith('/attachment')) {
        const parts = text.split(' ');
        if (parts.length < 3) {
            await sendTelegramMessage(chatId, '❗ Usage: `/attachment <message_id> <attachment_id>`');
        } else {
            const messageId = parts[1];
            const attachmentId = parts[2];
            const attachment = await getAttachment(messageId, attachmentId);

            if (attachment) {
                await sendDocument(chatId, attachment);
            } else {
                await sendTelegramMessage(chatId, '❌ Attachment not found or failed to fetch.');
            }
        }
    } 
    else if (text === '/me') {
        const accountDetails = await getAccountDetails();
        if (accountDetails && accountDetails.id) {
            await sendTelegramMessage(chatId, 
                `👤 **Account Details:**\n📩 Email: \`${accountDetails.address}\`\n🆔 ID: \`${accountDetails.id}\`\n🟢 Verified: ${accountDetails.isVerified ? 'Yes ✅' : 'No ❌'}`
            );
        } else {
            await sendTelegramMessage(chatId, '❌ Failed to fetch account details.');
        }
    } 
    else {
        await sendTelegramMessage(chatId, "❓ Unknown command. Use `/start` for help.");
    }

    return new Response('OK');
}

// ✅ Create Mail.tm Account
async function createMailAccount() {
    const randomName = `user${Math.floor(Math.random() * 10000)}@mail.tm`;
    const password = 'password123';

    const response = await fetch(`${MAIL_TM_API}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            address: randomName,
            password: password
        })
    });

    const data = await response.json();
    await saveAccountCredentials(data.id, randomName, password);
    return { ...data, password };
}

// 📥 Get Email Attachment
async function getAttachment(messageId, attachmentId) {
    const { email, password } = await getAccountCredentials();
    const token = await getAuthToken(email, password);

    const response = await fetch(`${MAIL_TM_API}/messages/${messageId}/attachment/${attachmentId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) return null;

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    return {
        name: `attachment_${attachmentId}.bin`,
        content: Buffer.from(buffer).toString('base64')  // Convert binary data to base64
    };
}

// 📥 Fetch Inbox Messages
async function getInboxMessages() {
    const response = await fetch(`${MAIL_TM_API}/messages`);
    const data = await response.json();
    return data['hydra:member'];
}

// 👤 Get Account Details
async function getAccountDetails() {
    const { email, password } = await getAccountCredentials();
    const token = await getAuthToken(email, password);

    const response = await fetch(`${MAIL_TM_API}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data;
}

// 🔐 Get Auth Token for Authentication
async function getAuthToken(email, password) {
    const response = await fetch(`${MAIL_TM_API}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: email, password: password })
    });

    const data = await response.json();
    return data.token;
}

// 🔒 Store Account Credentials (Temporary Storage)
const accountStorage = {};

async function saveAccountCredentials(id, email, password) {
    accountStorage['account'] = { id, email, password };
}

async function getAccountCredentials() {
    return accountStorage['account'] || {};
}

// 📲 Send Telegram Message
async function sendTelegramMessage(chatId, text) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        })
    });
}

// 📄 Send Telegram Document
async function sendDocument(chatId, attachment) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendDocument`, {
        method: 'POST',
        body: JSON.stringify({
            chat_id: chatId,
            document: `data:application/octet-stream;base64,${attachment.content}`,
            caption: `📎 Attachment: ${attachment.name}`
        }),
        headers: { 'Content-Type': 'application/json' }
    });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
