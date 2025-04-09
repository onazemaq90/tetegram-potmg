const BOT_TOKEN = `7664037049:AAFTD25g8wQ-b_gLV18Kg-Zbv_b1gLtvyzY`; // Replace with your actual bot token
const START_PIC = `https://t.me/kajal_developer/98`; // Replace with your image URL
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Text templates
const Txt = {
  START_TXT: `Hello {} 👋 

➻ This Is An Advanced And Yet Powerful Rename Bot.

➻ Using This Bot You Can Rename And Change Thumbnail Of Your Files.

➻ You Can Also Convert Video To File And File To Video.

➻ This Bot Also Supports Custom Thumbnail And Custom Caption.

<b>Bot Is Made By :</b> @Madflix_Bots`,

  ABOUT_TXT: `╭───────────────⍟
├<b>🤖 My Name</b> : {}
├<b>🖥️ Developer</b> : <a href="https://t.me/Madflix_Bots">Madflix Botz</a> 
├<b>👨‍💻 Programer</b> : <a href="https://t.me/MadflixOfficials">Jishu Developer</a>
├<b>📕 Library</b> : <a href=""></a>
├<b>✏️ Language</b> : <a href="https://"></a>
├<b>💾 Database</b> : <a href="https://"></a>
├<b>📊 Build Version</b> : <a href="https:///jishu.editz">Rename </a></b>     
╰───────────────⍟`,

  HELP_TXT: `🌌 <b><u>How To Set Thumbnail</u></b>
  
➪ /start - Start The Bot And Send Any Photo To Automatically Set Thumbnail.
➪ /del_thumb - Use This Command To Delete Your Old Thumbnail.
➪ /view_thumb - Use This Command To View Your Current Thumbnail.

📑 <b><u>How To Set Custom Caption</u></b>

➪ /set_caption - Use This Command To Set A Custom Caption
➪ /see_caption - Use This Command To View Your Custom Caption
➪ /del_caption - Use This Command To Delete Your Custom Caption
➪ Example - <code>/set_caption 📕 Name ➠ : {filename}

🔗 Size ➠ : {filesize} 

⏰ Duration ➠ : {duration}</code>

✏️ <b><u>How To Rename A File</u></b>

➪ Send Any File And Type New File Name And Select The Format [ Document, Video, Audio ].           

𝗔𝗻𝘆 𝗢𝘁𝗵𝗲𝗿 𝗛𝗲𝗹𝗽 𝗖𝗼𝗻𝘁𝗮𝗰𝘁 :- <a href="https://t.me/MadflixOfficials">Developer</a>`,

  DONATE_TXT: `<b>🥲 Thanks For Showing Interest In Donation! ❤️</b>

If You Like My Bots & Projects, You Can 🎁 Donate Me Any Amount From 10 Rs Upto Your Choice.

<b>🛍 UPI ID:</b> <code>madflixofficial@axl</code>`
};

// Helper function to send API requests
async function sendTelegramRequest(method, data) {
  const url = `${BASE_URL}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

// Handle inline keyboard callbacks
async function handleCallbackQuery(callbackQuery) {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const userMention = `<a href="tg://user?id=${callbackQuery.from.id}">${callbackQuery.from.first_name}</a>`;

  if (data === "start") {
    await editMessage(chatId, messageId, Txt.START_TXT.replace('{}', userMention), {
      inline_keyboard: [
        [
          { text: '🔊 Updates', url: 'https://t.me/Madflix_Bots' },
          { text: '♻️ Sᴜᴩᴩᴏʀᴛ', url: 'https://t.me/MadflixBots_Support' }
        ],
        [
          { text: '❤️‍🩹 About', callback_data: 'about' },
          { text: '🛠️ Help', callback_data: 'help' }
        ],
        [
          { text: "👨‍💻 Developer", url: 'https://t.me/CallAdminRobot' }
        ]
      ],
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } 
  else if (data === "help") {
    await editMessage(chatId, messageId, Txt.HELP_TXT, {
      inline_keyboard: [
        [{ text: "⚡ 4GB Rename Bot", url: "https://t.me/FileRenameXProBot" }],
        [
          { text: "🔒 Close", callback_data: "close" },
          { text: "◀️ Back", callback_data: "start" }
        ]
      ],
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } 
  else if (data === "about") {
    await editMessage(chatId, messageId, Txt.ABOUT_TXT.replace('{}', userMention), {
      inline_keyboard: [
        [{ text: "🤖 More Bots", url: "https://t.me/Madflix_Bots/7" }],
        [
          { text: "🔒 Cʟᴏꜱᴇ", callback_data: "close" },
          { text: "◀️ Bᴀᴄᴋ", callback_data: "start" }
        ]
      ],
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  } 
  else if (data === "close") {
    await deleteMessage(chatId, messageId);
  }
}

// Edit message helper
async function editMessage(chatId, messageId, text, replyMarkup) {
  return await sendTelegramRequest('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    reply_markup: replyMarkup,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });
}

// Delete message helper
async function deleteMessage(chatId, messageId) {
  return await sendTelegramRequest('deleteMessage', {
    chat_id: chatId,
    message_id: messageId
  });
}

// Handle /start command
async function handleStartCommand(message) {
  const chatId = message.chat.id;
  const userMention = `<a href="tg://user?id=${message.from.id}">${message.from.first_name}</a>`;
  
  const button = {
    inline_keyboard: [
      [
        { text: '🔊 Updates', url: 'https://t.me/Madflix_Bots' },
        { text: '♻️ Sᴜᴩᴩᴏʀᴛ', url: 'https://t.me/MadflixBots_Support' }
      ],
      [
        { text: '❤️‍🩹 About', callback_data: 'about' },
        { text: '🛠️ Help', callback_data: 'help' }
      ],
      [
        { text: "👨‍💻 Developer", url: 'https://t.me/CallAdminRobot' }
      ]
    ]
  };

  if (START_PIC) {
    await sendTelegramRequest('sendPhoto', {
      chat_id: chatId,
      photo: START_PIC,
      caption: Txt.START_TXT.replace('{}', userMention),
      reply_markup: button,
      parse_mode: 'HTML'
    });
  } else {
    await sendTelegramRequest('sendMessage', {
      chat_id: chatId,
      text: Txt.START_TXT.replace('{}', userMention),
      reply_markup: button,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });
  }
}

// Handle /donate command
async function handleDonateCommand(message) {
  const chatId = message.chat.id;
  
  await sendTelegramRequest('sendMessage', {
    chat_id: chatId,
    text: Txt.DONATE_TXT,
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🦋 Admin", url: "https://t.me/CallAdminRobot" },
          { text: "✖️ Close", callback_data: "close" }
        ]
      ]
    },
    parse_mode: 'HTML'
  });
}

// Main worker handler
export default {
  async fetch(request, env, ctx) {
    if (request.method === 'POST') {
      const update = await request.json();
      
      if (update.message) {
        const message = update.message;
        
        if (message.text) {
          if (message.text.startsWith('/start')) {
            await handleStartCommand(message);
          } else if (message.text.startsWith('/donate')) {
            await handleDonateCommand(message);
          }
        }
      } 
      else if (update.callback_query) {
        await handleCallbackQuery(update.callback_query);
      }
      
      return new Response('OK');
    }
    
    return new Response('Method not allowed', { status: 405 });
  }
};
