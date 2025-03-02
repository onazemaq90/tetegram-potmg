addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

// Telegram Bot Token (replace with your token from BotFather)
const TELEGRAM_BOT_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/`;

// Utility Functions
function isValidBin(binNumber) {
  if (!/^\d+$/.test(binNumber)) return false;
  if (binNumber.length < 6) return false;
  return true;
}

async function getBinInfo(binNumber) {
  try {
    const response = await fetch(`https://lookup.binlist.net/${binNumber}`);
    if (response.status === 200) return await response.json();
    return null;
  } catch (e) {
    return null;
  }
}

function generateCard(binPrefix, length = 16) {
  let cardNumber = binPrefix;
  while (cardNumber.length < length - 1) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  const digits = cardNumber.split("").map(Number);
  const oddDigits = digits.slice().reverse().filter((_, i) => i % 2 === 0);
  const evenDigits = digits.slice().reverse().filter((_, i) => i % 2 === 1);
  let total = oddDigits.reduce((a, b) => a + b, 0);

  for (const d of evenDigits) {
    total += Math.floor((d * 2) / 10) + ((d * 2) % 10);
  }

  const checkDigit = (10 - (total % 10)) % 10;
  return cardNumber + checkDigit;
}

function generateCardDetails() {
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const currentYear = new Date().getFullYear() % 100; // Last 2 digits
  const year = String(currentYear + Math.floor(Math.random() * 5) + 1);
  const cvv = String(Math.floor(Math.random() * 900) + 100); // 100-999
  return [month, year, cvv];
}

// Telegram Message Handlers
async function sendMessage(chatId, text) {
  const url = `${API_URL}sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}

async function handleRequest(request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const update = await request.json();
  if (!update.message) {
    return new Response("No message found", { status: 200 });
  }

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();

  // Handle /start or /help
  if (text === "/start" || text === "/help") {
    const welcomeText = `
Welcome to CC Generator Bot!

Commands:
/gen BIN or .gen BIN - Generate 15 credit cards with the specified BIN
Example: /gen 446542

The bot will generate valid credit card numbers using the Luhn algorithm.
    `;
    await sendMessage(chatId, welcomeText);
    return new Response("OK", { status: 200 });
  }

  // Handle /gen or .gen
  if (text.startsWith("/gen") || text.startsWith(".gen")) {
    const parts = text.split(" ");
    if (parts.length < 2) {
      await sendMessage(chatId, "Please provide a BIN number. Example: /gen 446542");
      return new Response("OK", { status: 200 });
    }

    const binNumber = parts[1];
    if (!isValidBin(binNumber)) {
      await sendMessage(chatId, "Invalid BIN. Please provide a valid 6-digit BIN.");
      return new Response("OK", { status: 200 });
    }

    const binInfo = await getBinInfo(binNumber);
    let binInfoText = "⚠️ BIN not found in database.";
    if (binInfo) {
      binInfoText = "🏦 BIN Information:\n";
      binInfoText += `• Brand: ${binInfo.scheme?.toUpperCase() || "Unknown"}\n`;
      binInfoText += `• Type: ${binInfo.type?.toUpperCase() || "Unknown"}\n`;
      binInfoText += `• Bank: ${binInfo.bank?.name || "Unknown"}\n`;
      binInfoText += `• Country: ${binInfo.country?.name || "Unknown"} ${binInfo.country?.emoji || ""}\n`;
    }

    const cards = [];
    for (let i = 0; i < 15; i++) {
      const cardNumber = generateCard(binNumber);
      const [month, year, cvv] = generateCardDetails();
      cards.push(`${cardNumber}|${month}|${year}|${cvv}`);
    }

    const messageText = `
••• CC GENERATOR
• Format Used: ${binNumber}|xx|xx|xxx

${binInfoText}

Generated Cards:
${cards.join("\n")}
    `;
    await sendMessage(chatId, messageText);
    return new Response("OK", { status: 200 });
  }

  return new Response("OK", { status: 200 });
}
