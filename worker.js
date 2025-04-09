const BOT_TOKEN = `7664037049:AAFTD25g8wQ-b_gLV18Kg-Zbv_b1gLtvyzY`;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "POST") {
    const update = await request.json();
    
    // Handle Message (/start)
    if (update.message) {
      const chat_id = update.message.chat.id;
      const text = update.message.text;

      if (text === "/start") {
        const user_mention = update.message.from.first_name;

        const buttons = {
          inline_keyboard: [
            [
              { text: "🔊 Updates", url: "https://t.me/Madflix_Bots" },
              { text: "♻️ Sᴜᴩᴩᴏʀᴛ", url: "https://t.me/MadflixBots_Support" }
            ],
            [
              { text: "❤️‍🩹 About", callback_data: "about" },
              { text: "🛠️ Help", callback_data: "help" }
            ],
            [
              { text: "👨‍💻 Developer", url: "https://t.me/CallAdminRobot" }
            ]
          ]
        };

        await sendMessage(chat_id, `Hey ${user_mention}, welcome to the bot!`, buttons);
      }
    }

    // Handle Callback Query
    if (update.callback_query) {
      const chat_id = update.callback_query.message.chat.id;
      const message_id = update.callback_query.message.message_id;
      const data = update.callback_query.data;
      const user_mention = update.callback_query.from.first_name;

      if (data === "about") {
        await editMessage(chat_id, message_id, `🤖 This bot was made with love by ${user_mention}.`, {
          inline_keyboard: [
            [{ text: "🤖 More Bots", url: "https://t.me/Madflix_Bots/7" }],
            [
              { text: "🔒 Cʟᴏꜱᴇ", callback_data: "close" },
              { text: "◀️ Bᴀᴄᴋ", callback_data: "start" }
            ]
          ]
        });
      } else if (data === "help") {
        await editMessage(chat_id, message_id, `⚙️ Here's how to use this bot: ...`, {
          inline_keyboard: [
            [{ text: "⚡ 4GB Rename Bot", url: "https://t.me/FileRenameXProBot" }],
            [
              { text: "🔒 Close", callback_data: "close" },
              { text: "◀️ Back", callback_data: "start" }
            ]
          ]
        });
      } else if (data === "start") {
        await editMessage(chat_id, message_id, `Hey ${user_mention}, welcome back!`, {
          inline_keyboard: [
            [
              { text: "🔊 Updates", url: "https://t.me/Madflix_Bots" },
              { text: "♻️ Sᴜᴩᴩᴏʀᴛ", url: "https://t.me/MadflixBots_Support" }
            ],
            [
              { text: "❤️‍🩹 About", callback_data: "about" },
              { text: "🛠️ Help", callback_data: "help" }
            ],
            [
              { text: "👨‍💻 Developer", url: "https://t.me/CallAdminRobot" }
            ]
          ]
        });
      } else if (data === "close") {
        await deleteMessage(chat_id, message_id);
      }
    }

    return new Response("OK");
  }

  return new Response("Use POST to send updates.");
}

// Helper Functions
async function sendMessage(chat_id, text, reply_markup = null) {
  const payload = {
    chat_id,
    text,
    parse_mode: "HTML",
    reply_markup
  };
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function editMessage(chat_id, message_id, text, reply_markup = null) {
  const payload = {
    chat_id,
    message_id,
    text,
    parse_mode: "HTML",
    reply_markup
  };
  await fetch(`${BASE_URL}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function deleteMessage(chat_id, message_id) {
  await fetch(`${BASE_URL}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, message_id })
  });
}
