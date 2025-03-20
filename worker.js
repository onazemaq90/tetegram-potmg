export default {
  async fetch(request) {
    const TELEGRAM_BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
    const CHANNEL_ID = '@arraxs'; // Replace with your channel username or ID

    const url = new URL(request.url);
    if (request.method === 'POST' && url.pathname === '/webhook') {
      const update = await request.json();
      if (update.message) {
        return await handleMessage(update.message, TELEGRAM_BOT_TOKEN, CHANNEL_ID);
      }
    }

    return new Response("Hello from Cloudflare Workers!", { status: 200 });
  }
};

async function handleMessage(message, botToken, channelId) {
  const chatId = message.chat.id;
  const firstName = message.from.first_name || "";
  const lastName = message.from.last_name || "";
  const userId = message.from.id;
  const username = message.from.username ? `@${message.from.username}` : "No Username";

  if (message.text === "/start") {
    return sendWelcomeMessage(botToken, chatId);
  } else if (message.contact) {
    return handleContact(botToken, chatId, message.contact, channelId);
  }

  return sendMessage(botToken, chatId, "Please click the button below to share your contact.", [
    [{ text: "📞 Share Contact", request_contact: true }],
  ]);
}

async function sendWelcomeMessage(botToken, chatId) {
  const text = "👋 Welcome! Click the button below to share your contact information.";
  const keyboard = [[{ text: "📞 Share Contact", request_contact: true }]];
  return sendMessage(botToken, chatId, text, keyboard);
}

async function handleContact(botToken, chatId, contact, channelId) {
  const { user_id, phone_number, first_name, last_name } = contact;
  const profilePicUrl = await getUserProfilePic(botToken, user_id);

  const messageText = `📌 New Contact Shared:\n\n👤 *Name:* ${first_name} ${last_name || ''}\n🆔 *User ID:* ${user_id}\n📞 *Phone:* ${phone_number}`;
  
  // Send user data to the channel
  await sendMessage(botToken, channelId, messageText);
  
  // Send confirmation to the user
  return sendMessage(botToken, chatId, "✅ Thank you! Your contact has been shared.");
}

async function getUserProfilePic(botToken, userId) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${userId}`);
  const data = await response.json();

  if (data.ok && data.result.photos.length > 0) {
    const photoArray = data.result.photos[0];
    const fileId = photoArray[photoArray.length - 1].file_id;
    
    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json();
    
    if (fileData.ok) {
      return `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
    }
  }
  
  return "No Profile Picture";
}

async function sendMessage(botToken, chatId, text, keyboard = null) {
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
    reply_markup: keyboard ? { keyboard: keyboard, one_time_keyboard: true, resize_keyboard: true } : undefined,
  };

  return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
