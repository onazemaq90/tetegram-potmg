export default {
  async fetch(request) {
    const TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'; // Replace with your bot token
    const API_URL = `https://api.telegram.org/bot${TOKEN}`;
    const VERCEL_API = 'https://pinterest-downloader-three.vercel.app/api/download'; // Update your Vercel API URL

    if (request.method === 'POST') {
      const update = await request.json();
      
      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        if (text && text.startsWith('http')) {
          await sendMessage(chatId, '🔄 Downloading your file... Please wait.');

          try {
            // Call the Vercel API to download media
            const response = await fetch(`${VERCEL_API}?url=${encodeURIComponent(text)}`);
            const data = await response.json();

            if (data.success && data.url) {
              // Send the downloaded file back to the user
              await sendMedia(chatId, data.url, data.type);
            } else {
              await sendMessage(chatId, '❌ Failed to download. Please check the URL.');
            }
          } catch (error) {
            await sendMessage(chatId, '⚠️ Error processing your request.');
          }
        } else {
          await sendMessage(chatId, '📩 Send me a video or image link to download.');
        }
      }

      return new Response('OK', { status: 200 });
    }
    return new Response('Invalid Request', { status: 400 });
    
    async function sendMessage(chatId, text) {
      await fetch(`${API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text })
      });
    }

    async function sendMedia(chatId, fileUrl, type) {
      const endpoint = type === 'video' ? 'sendVideo' : 'sendPhoto';
      await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, [type === 'video' ? 'video' : 'photo']: fileUrl })
      });
    }
  }
};
