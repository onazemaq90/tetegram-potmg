addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const TELEGRAM_TOKEN = TELEGRAM_TOKEN || '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4'; // Use environment variable
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const update = await request.json();
  const message = update.message || update.edited_message;
  if (!message || !message.text) {
    return new Response('No message', { status: 200 });
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Handle /start and /help commands
  if (text === '/start' || text === '/help') {
    const welcomeText = `Welcome to CC Generator Bot!\n\nCommands:\n/gen BIN or .gen BIN - Generate 15 credit cards with the specified BIN\nExample: /gen 446542\n\nThe bot will generate valid credit card numbers using the Luhn algorithm.`;
    await sendMessage(TELEGRAM_API, chatId, welcomeText);
    return new Response('OK', { status: 200 });
  }

  // Handle /gen or .gen commands
  if (text.startsWith('/gen') || text.startsWith('.gen')) {
    const parts = text.split(' ');
    if (parts.length < 2) {
      await sendMessage(TELEGRAM_API, chatId, 'Please provide a BIN number. Example: /gen 446542');
      return new Response('OK', { status: 200 });
    }

    const binNumber = parts[1];
    if (!isValidBin(binNumber)) {
      await sendMessage(TELEGRAM_API, chatId, 'Invalid BIN. Please provide a valid 6-digit BIN.');
      return new Response('OK', { status: 200 });
    }

    // Fetch BIN info
    const binInfo = await getBinInfo(binNumber);
    let binInfoText = '⚠️ BIN not found in database.';
    if (binInfo) {
      binInfoText = '🏦 BIN Information:\n' +
        `• Brand: ${binInfo.scheme?.toUpperCase() || 'Unknown'}\n` +
        `• Type: ${binInfo.type?.toUpperCase() || 'Unknown'}\n` +
        (binInfo.bank ? `• Bank: ${binInfo.bank.name || 'Unknown'}\n` : '') +
        (binInfo.country ? `• Country: ${binInfo.country.name || 'Unknown'} ${binInfo.country.emoji || ''}\n` : '');
    }

    // Generate 15 cards
    const cards = [];
    for (let i = 0; i < 15; i++) {
      const cardNumber = generateCard(binNumber);
      const [month, year, cvv] = generateCardDetails();
      cards.push(`${cardNumber}|${month}|${year}|${cvv}`);
    }

    // Format response
    const messageText = `••• CC GENERATOR\n` +
      `• Format Used: ${binNumber}|xx|xx|xxx\n\n` +
      `${binInfoText}\n\n` +
      `Generated Cards:\n${cards.join('\n')}`;
    await sendMessage(TELEGRAM_API, chatId, messageText);
    return new Response('OK', { status: 200 });
  }

  return new Response('Unhandled command', { status: 200 });
}

// Validate BIN
function isValidBin(binNumber) {
  if (!/^\d+$/.test(binNumber)) return false;
  if (binNumber.length < 6) return false;
  return true;
}

// Fetch BIN info
async function getBinInfo(binNumber) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${binNumber}`);
    if (response.ok) return await response.json();
    return null;
  } catch {
    return null;
  }
}

// Generate card number with Luhn algorithm
function generateCard(binPrefix, length = 16) {
  let cardNumber = binPrefix;
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  const digits = cardNumber.split('').map(Number);
  const oddDigits = digits.slice().reverse().filter((_, i) => i % 2 === 0);
  const evenDigits = digits.slice().reverse().filter((_, i) => i % 2 !== 0);
  let total = oddDigits.reduce((a, b) => a + b, 0);
  for (const d of evenDigits) {
    const doubled = d * 2;
    total += Math.floor(doubled / 10) + (doubled % 10);
  }

  const checkDigit = (10 - (total % 10)) % 10;
  return cardNumber + checkDigit;
}

// Generate card details (month, year, CVV)
function generateCardDetails() {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const currentYear = new Date().getFullYear() % 100; // Last two digits
  const year = String(currentYear + Math.floor(Math.random() * 5) + 1);
  const cvv = String(Math.floor(Math.random() * 900) + 100); // 100-999
  return [month, year, cvv];
}

// Send message to Telegram
async function sendMessage(api, chatId, text) {
  await fetch(`${api}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}
