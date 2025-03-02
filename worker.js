addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const BOT_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json();
    await handleUpdate(update);
    return new Response('OK');
  }
  return new Response('Not found', { status: 404 });
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message || !message.text) return;

  const text = message.text;
  const chatId = message.chat.id;

  if (text.startsWith('/start') || text.startsWith('/help')) {
    await sendWelcome(chatId);
  } else if (text.startsWith('/gen') || text.startsWith('.gen')) {
    await handleGenCommand(chatId, text);
  }
}

async function sendWelcome(chatId) {
  const welcomeText = `Welcome to CC Generator Bot!\n\nCommands:\n/gen BIN or .gen BIN - Generate 15 credit cards with the specified BIN\nExample: /gen 446542\n\nThe bot will generate valid credit card numbers using the Luhn algorithm.`;
  await sendMessage(chatId, welcomeText);
}

async function handleGenCommand(chatId, text) {
  const commandParts = text.split(' ');
  if (commandParts.length < 2) {
    await sendMessage(chatId, "Please provide a BIN number. Example: /gen 446542");
    return;
  }

  const binNumber = commandParts[1];
  if (!isValidBin(binNumber)) {
    await sendMessage(chatId, "Invalid BIN. Please provide a valid 6-digit BIN.");
    return;
  }

  const binInfo = await getBinInfo(binNumber);
  const cards = generateCards(binNumber);
  
  let response = `••• CC GENERATOR\n• Format Used: ${binNumber}|xx|xx|xxx\n\n`;
  response += formatBinInfo(binInfo) + '\n';
  response += cards.join('\n');

  await sendMessage(chatId, response);
}

function isValidBin(binNumber) {
  return /^\d{6}$/.test(binNumber);
}

async function getBinInfo(binNumber) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${binNumber}`, {
      headers: { 'Accept-Version': '3' }
    });
    return response.ok ? await response.json() : null;
  } catch (error) {
    return null;
  }
}

function formatBinInfo(binInfo) {
  if (!binInfo) return "⚠️ BIN not found in database.";
  
  let info = "🏦 BIN Information:\n";
  info += `• Brand: ${binInfo.scheme?.toUpperCase() || 'Unknown'}\n`;
  info += `• Type: ${binInfo.type?.toUpperCase() || 'Unknown'}\n`;
  info += `• Bank: ${binInfo.bank?.name || 'Unknown'}\n`;
  info += `• Country: ${binInfo.country?.name || 'Unknown'} ${binInfo.country?.emoji || ''}`;
  
  return info;
}

function generateCards(binPrefix) {
  const cards = [];
  for (let i = 0; i < 15; i++) {
    const cardNumber = generateCard(binPrefix);
    const [month, year, cvv] = generateCardDetails();
    cards.push(`${cardNumber}|${month}|${year}|${cvv}`);
  }
  return cards;
}

function generateCard(binPrefix, length = 16) {
  let cardNumber = binPrefix;
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  const digits = cardNumber.split('').map(Number);
  let total = 0;
  for (let i = 0; i < digits.length; i++) {
    let num = digits[i];
    if ((i + 1) % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    total += num;
  }
  
  const checkDigit = (10 - (total % 10)) % 10;
  return cardNumber + checkDigit;
}

function generateCardDetails() {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const currentYear = new Date().getFullYear() % 100;
  const year = String(currentYear + Math.floor(Math.random() * 5) + 1);
  const cvv = String(Math.floor(Math.random() * 900) + 100);
  return [month, year, cvv];
}

async function sendMessage(chatId, text) {
  const url = `${BASE_URL}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}
