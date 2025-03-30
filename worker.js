export default {
  // Store your bot token in your environment variables
  async fetch(request, env) {
    const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
    const CHANNEL_ID = env.CHANNEL_ID; // The channel ID where photos are stored
    
    if (request.method !== "POST") {
      return new Response("Expected a POST request", { status: 405 });
    }

    try {
      const payload = await request.json();
      
      // Check if this is a message with a command
      if (payload.message?.text?.startsWith('/photo')) {
        // Handle the /photo command
        return await handlePhotoCommand(BOT_TOKEN, CHANNEL_ID, payload.message.chat.id);
      }

      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
};

async function handlePhotoCommand(botToken, channelId, chatId) {
  try {
    // 1. First, get messages from the channel
    const messagesResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getChannelMessages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: channelId,
          limit: 530 // Adjust this number as needed
        })
      }
    );

    const messages = await messagesResponse.json();
    
    // 2. Filter messages that contain photos
    const photoMessages = messages.result.filter(msg => msg.photo);
    
    if (photoMessages.length === 0) {
      // If no photos found, send an error message
      return await sendMessage(botToken, chatId, "No photos found in the channel!");
    }

    // 3. Pick a random photo from the filtered messages
    const randomPhoto = photoMessages[Math.floor(Math.random() * photoMessages.length)];
    
    // 4. Forward the selected photo
    const forwardResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/forwardMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          from_chat_id: channelId,
          message_id: randomPhoto.message_id
        })
      }
    );

    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

async function sendMessage(botToken, chatId, text) {
  return await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    }
  );
}
