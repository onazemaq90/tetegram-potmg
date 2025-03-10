// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const TELEGRAM_API = 'https://api.telegram.org/bot';
const BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4'; // Replace with your actual bot token

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json();
    await processTelegramUpdate(update);
    return new Response('OK', { status: 200 });
  }
  
  return new Response('Bot is running', { status: 200 });
}

// Telegram API helper function
async function apiRequest(method, data) {
  const response = await fetch(`${TELEGRAM_API}${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}

// Process incoming Telegram updates
async function processTelegramUpdate(update) {
  if (!update.message && !update.callback_query) return;

  const chatId = update.message?.chat.id || update.callback_query?.message.chat.id;
  const user = update.message?.from || update.callback_query?.from;
  const command = update.message?.text || update.callback_query?.data;

  switch (command) {
    case '/start':
      await handleStart(chatId, user);
      break;
    case '/joined':
      await handleJoined(chatId, user);
      break;
    default:
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: 'Unknown command. Use /start to begin.'
      });
  }
}

// /start command handler
async function handleStart(chatId, user) {
  const joinButtons = [
    [
      { text: "🚀 Join Channel 1", url: "https://t.me/Starxnetwork" },
      { text: "🚀 Join Channel 2", url: "https://t.me/starxbackup" }
    ],
    [
      { text: "🚀 Join Support", url: "https://t.me/StarX_Support" },
      { text: "🚀 Updates", url: "https://t.me/+lJ3m8WWL5-BkN2Y1" }
    ],
    [
      { text: "✅ Joined ✅", callback_data: "/joined" }
    ]
  ];

  const userName = user.first_name || "User";
  const userId = user.id || "Unknown";

  await apiRequest('sendPhoto', {
    chat_id: chatId,
    photo: "https://t.me/STAR_X_BACKUP/66",
    caption: 
      `*🙋‍♂ Welcome* [${userName}](tg://user?id=${userId})\n\n` +
      "🔎 *You must join our channels before using this bot.*\n\n" +
      "📢 *Click the buttons below to join the required channels.*\n" +
      "✅ After joining, click the **'Joined'** button.",
    reply_markup: {
      inline_keyboard: joinButtons
    },
    parse_mode: "Markdown"
  });
}

// /joined command handler
async function handleJoined(chatId, user) {
  const channel2 = "@lt_MrVirus";
  const userId = user.id;

  try {
    const response = await apiRequest('getChatMember', {
      chat_id: channel2,
      user_id: userId
    });

    const userStatus = response.result.status;

    if (userStatus === "member" || userStatus === "administrator" || userStatus === "creator") {
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: "*✅ Welcome!*\nYou have successfully joined the channel.",
        parse_mode: "Markdown"
      });
      // Add your /mainmenu command logic here
    } else if (userStatus === "left" || userStatus === "kicked") {
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: 
          "*⚠️ Channel Subscription Required*\n\n" +
          "Please join our channel to use this bot:\n" +
          "@lt_MrVirus\n\n" +
          "After joining, type /start again.",
        parse_mode: "Markdown"
      });
    } else {
      await apiRequest('sendMessage', {
        chat_id: chatId,
        text: 
          "*❌ Access Denied*\n\n" +
          "Something went wrong. Please try again or contact support.\n" +
          "Status: `" + userStatus + "`",
        parse_mode: "Markdown"
      });
    }
  } catch (error) {
    await apiRequest('sendMessage', {
      chat_id: chatId,
      text: "An error occurred. Please try again later."
    });
  }
}
