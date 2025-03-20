export default {
  async fetch(request) {
    const url = new URL(request.url);
    const botToken = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4";
    const channelID = "@@arraxs";  // Change this to your channel username or ID

    if (request.method === "POST") {
      const update = await request.json();

      if (update?.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text;

        // If user taps "Send Contact" button
        if (update.message.contact) {
          const userID = update.message.contact.user_id;
          const userName = update.message.contact.first_name + 
                          (update.message.contact.last_name ? ` ${update.message.contact.last_name}` : "");
          const phoneNumber = update.message.contact.phone_number;

          // Send user data to channel
          await sendMessage(botToken, channelID, `📩 **New Contact Shared:**\n\n👤 **Name:** ${userName}\n🆔 **User ID:** ${userID}\n📞 **Phone:** ${phoneNumber}`);

          // Notify user
          await sendMessage(botToken, chatId, "✅ Your contact details have been sent.");
        } 
        else {
          // Send welcome message with contact button
          const keyboard = {
            reply_markup: {
              keyboard: [[{ text: "📲 Share Contact", request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          };
          await sendMessage(botToken, chatId, "👋 Welcome! Tap the button below to share your contact.", keyboard);
        }
      }

      return new Response("OK", { status: 200 });
    }

    return new Response("Cloudflare Workers Telegram Bot", { status: 200 });
  }
};

// Function to send messages
async function sendMessage(token, chatId, text, keyboard = null) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
  };
  if (keyboard) body.reply_markup = keyboard;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
