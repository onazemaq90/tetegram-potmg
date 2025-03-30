export default {
  async fetch(request) {
    const TELEGRAM_BOT_TOKEN = "7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY"; // Replace with your bot token
    const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
    
    const requestBody = await request.json();
    const chat_id = requestBody.message?.chat?.id;
    const text = requestBody.message?.text;

    if (!chat_id || !text) return new Response("No chat ID or text", { status: 400 });

    if (text === "/start") {
      await sendMessage(chat_id, "Welcome! Send /photo to get a random image.");
    } else if (text === "/photo") {
      await sendRandomPhoto(chat_id);
    }

    return new Response("OK", { status: 200 });
  },
};

async function sendMessage(chat_id, text) {
  const TELEGRAM_API_URL = `https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage`;
  await fetch(TELEGRAM_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text }),
  });
}

async function sendRandomPhoto(chat_id) {
  const CHANNEL_ID = "@your_channel"; // Replace with your channel username or ID
  const TELEGRAM_API_URL = `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`;

  const response = await fetch(TELEGRAM_API_URL);
  const data = await response.json();

  const photos = data.result
    .filter(msg => msg.message?.chat?.username === CHANNEL_ID && msg.message?.photo)
    .map(msg => msg.message.photo.pop().file_id);

  if (photos.length === 0) {
    await sendMessage(chat_id, "No photos found!");
    return;
  }

  const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
  
  await fetch(`https://api.telegram.org/botYOUR_BOT_TOKEN/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, photo: randomPhoto }),
  });
}
