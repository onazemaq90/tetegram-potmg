/**
 * Telegram Bot implementation using Cloudflare Workers
 */

// Configuration - replace with your values
const TELEGRAM_BOT_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY';
const AI_API_URL = 'https://ai-api.magicstudio.com/api/ai-art-generator';

export default {
  async fetch(request, env, ctx) {
    // Only allow POST requests for webhook
    if (request.method !== 'POST') {
      return new Response('Only POST requests are allowed', { status: 405 });
    }

    try {
      const payload = await request.json();
      
      // Handle Telegram update
      if (payload.message) {
        return handleTelegramMessage(payload.message, env, ctx);
      }

      return new Response('No message found in the update', { status: 400 });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};

async function handleTelegramMessage(message, env, ctx) {
  const chatId = message.chat.id;
  const text = message.text || '';

  // Check if this is an /imagine command
  if (text.startsWith('/imagine')) {
    return handleImagineCommand(message, env, ctx);
  }

  // Send help message for other commands
  return sendTelegramMessage(chatId, 'Use /imagine <prompt> to generate an image');
}

async function handleImagineCommand(message, env, ctx) {
  const chatId = message.chat.id;
  const prompt = message.text.replace('/imagine', '').trim();

  if (!prompt) {
    return sendTelegramMessage(chatId, 'Please provide a prompt after /imagine');
  }

  // Send wait message
  const waitMessageResponse = await sendTelegramMessage(
    chatId, 
    'Please wait while I generate the image...'
  );
  
  const waitMessage = await waitMessageResponse.json();
  const waitMessageId = waitMessage.result.message_id;
  
  try {
    // Start time for tracking
    const startTime = Date.now();

    // Request to AI API
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        output_format: 'bytes',
        request_timestamp: Math.floor(Date.now() / 1000),
        user_is_subscribed: 'false',
      })
    });

    if (!response.ok) {
      throw new Error(`AI API returned ${response.status}`);
    }

    // Get image data
    const imageData = await response.arrayBuffer();
    
    // Delete wait message
    await deleteTelegramMessage(chatId, waitMessageId);

    // Send the generated image
    return sendTelegramPhoto(
      chatId, 
      imageData, 
      `Here's the generated image!\nTime Taken: ${(Date.now() - startTime) / 1000}s`
    );

  } catch (error) {
    // Update wait message with error
    return editTelegramMessage(
      chatId,
      waitMessageId,
      `Error generating image: ${error.message}`
    );
  }
}

async function sendTelegramMessage(chatId, text) {
  return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}

async function sendTelegramPhoto(chatId, photo, caption) {
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('photo', new Blob([photo]), 'image.jpg');
  formData.append('caption', caption);

  return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: 'POST',
    body: formData,
  });
}

async function deleteTelegramMessage(chatId, messageId) {
  return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
    }),
  });
}

async function editTelegramMessage(chatId, messageId, text) {
  return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text: text,
    }),
  });
}
