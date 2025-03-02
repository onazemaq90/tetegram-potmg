addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/webhook') {
    const body = await request.json();
    await handleTelegramUpdate(body);
    return new Response('OK', { status: 200 });
  }
  return new Response('Not Found', { status: 404 });
}

// Telegram API helper
async function sendMessage(chatId, text) {
  const telegramToken = 7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4; // Set in wrangler.toml
  const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
  await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    }),
  });
}

// Validation for BIN
function isValidBin(binNumber) {
  if (!/^\d+$/.test(binNumber)) return false;
  if (binNumber.length < 6) return false;
  return true;
}

// Fetch BIN info from binlist.net
async function getBinInfo(binNumber) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${binNumber}`);
    if (response.status === 200) return await response.json();
    return null;
  } catch {
    return null;
  }
}

// Generate card number using Luhn algorithm
function generateCard(binPrefix, length = 16) {
  let cardNumber = binPrefix;
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  const digits = cardNumber.split('').map(Number);
  const oddDigits = digits.slice(0, -1).reverse().filter((_, i) => i % 2 === 0);
  const evenDigits = digits.slice(0, -1).reverse().filter((_, i) => i % 2 !== 0);
  let total = oddDigits.reduce((a, b) => a + b, 0);

  for (const d of evenDigits) {
    const doubled = d * 2;
    total += Math.floor(doubled / 10) + (doubled % 10);
  }

  const checkDigit = (10 - (total % 10)) % 10;
  return cardNumber + checkDigit;
}

// Generate card details (expiry and CVV)
function generateCardDetails() {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const currentYear = new Date().getFullYear() % 100; // Last 2 digits
  const year = String(currentYear + Math.floor(Math.random() * 5) + 1);
  const cvv = String(Math.floor(Math.random() * 900) + 100); // 100-999
  return [month, year, cvv];
}

// Handle Telegram updates
async function handleTelegramUpdate(update) {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Welcome message
  if (text === '/start' || text === '/help') {
    const welcomeText = `
Welcome to CC Generator Bot!

**Commands:**
/gen BIN or .gen BIN - Generate 15 credit cards with the specified BIN
Example: /gen 446542

The bot will generate valid credit card numbers using the Luhn algorithm.
    `;
    await sendMessage(chatId, welcomeText);
    return;
  }

  // Handle /gen or .gen command
  if (text.startsWith('/gen') || text.startsWith('.gen')) {
    const parts = text.split(' ');
    if (parts.length < 2) {
      await sendMessage(chatId, 'Please provide a BIN number. Example: /gen 446542');
      return;
    }

    const binNumber = parts[1];
    if (!isValidBin(binNumber)) {
      await sendMessage(chatId, 'Invalid BIN. Please provide a valid 6-digit BIN.');
      return;
    }

    // Fetch BIN info
    const binInfo = await getBinInfo(binNumber);
    let binInfoText = '⚠️ BIN not found in database.';
    if (binInfo) {
      binInfoText = `*🏦 BIN Information:*\n`;
      binInfoText += `• Brand: ${binInfo.scheme?.toUpperCase() || 'Unknown'}\n`;
      binInfoText += `• Type: ${binInfo.type?.toUpperCase() || 'Unknown'}\n`;
      if (binInfo.bank) binInfoText += `• Bank: ${binInfo.bank.name || 'Unknown'}\n`;
      if (binInfo.country) {
        binInfoText += `• Country: ${binInfo.country.name || 'Unknown'} ${binInfo.country.emoji || ''}\n`;
      }
    }

    // Generate 15 cards
    const cards = [];
    for (let i = 0; i < 15; i++) {
      const cardNumber = generateCard(binNumber);
      const [month, year, cvv] = generateCardDetails();
      cards.push(`${cardNumber}|${month}|${year}|${cvv}`);
    }

    // Format response
    const messageText = `
*••• CC GENERATOR*
• Format Used: \`${binNumber}|xx|xx|xxx\`

${binInfoText}

*Generated Cards:*
${cards.map(card => `\`${card}\``).join('\n')}
    `;
    await sendMessage(chatId, messageText);
  }
}

// Set webhook during deployment (run this once manually)
async function setWebhook() {
  const telegramToken = TELEGRAM_TOKEN;
  const workerUrl = 'https://telegram-bot.YOUR_WORKER.workers.dev/webhook'; // Replace with your Worker URL
  const response = await fetch(
    `https://api.telegram.org/bot${telegramToken}/setWebhook?url=${workerUrl}`
  );
  console.log(await response.json());
}
