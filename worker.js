addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const ADMIN_ID = '7912527708';

let user_data = {};
let redeem_codes = {};
let live_member_count = 0;

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/webhook' && request.method === 'POST') {
    const update = await request.json();
    await handleUpdate(update);
    return new Response('OK', { status: 200 });
  }

  return new Response('Not Found', { status: 404 });
}

async function handleUpdate(update) {
  if (update.message) {
    const message = update.message;
    const user_id = message.from.id;
    const text = message.text;

    if (text === '/start') {
      await startCommand(message);
    } else if (text.startsWith('/redeem')) {
      await redeemCommand(message);
    } else if (text.startsWith('/use_redeem')) {
      await useRedeemCommand(message);
    } else {
      await handleMessage(message);
    }
  } else if (update.callback_query) {
    await buttonHandler(update.callback_query);
  }
}

async function startCommand(message) {
  const user_id = message.from.id;
  const user_name = message.from.first_name;
  const args = message.text.split(' ');

  const referrer_id = args[1] ? args[1].replace("Bot", "") : null;
  if (referrer_id && parseInt(referrer_id) !== user_id) {
    if (!user_data[user_id]) {
      user_data[user_id] = { credits: 3, referrer: parseInt(referrer_id) };
      user_data[parseInt(referrer_id)].credits += 1;
      await sendMessage(parseInt(referrer_id), "🎉 Someone joined using your invite! You earned +1 credit. 💰");
    }
  }

  if (!user_data[user_id]) {
    user_data[user_id] = { credits: 3, referrer: null };
    live_member_count += 1;
  }

  const invite_link = `https://t.me/your_bot_username?start=Bot${user_id}`;
  const welcome_msg = `👋 Welcome, ${user_name} 🎉\n\n💡 Explore the bot options below.\n__________________________`;

  const keyboard = [
    [{ text: "🐍 WORM GPT 🐍", callback_data: "worm_gpt" }, { text: "💰 CREDIT 💰", callback_data: "credit" }],
    [{ text: "🔥 DEV 🔥", url: "https://t.me/GOAT_NG" }]
  ];

  await sendMessage(user_id, welcome_msg, keyboard);
}

async function buttonHandler(callback_query) {
  const user_id = callback_query.from.id;
  const data = callback_query.data;

  if (data === "worm_gpt") {
    const keyboard = [[{ text: "BACK", callback_data: "main_menu" }]];
    await editMessage(callback_query.message.chat.id, callback_query.message.message_id, "💬 Ask your query below:", keyboard);
  } else if (data === "credit") {
    const credits = user_data[user_id]?.credits || 0;
    const invite_link = `https://t.me/your_bot_username?start=Bot${user_id}`;
    const message = `💰 Your Credits: ${credits}\n\n📊 Total Members: ${live_member_count}\n\nInvite friends to earn more credits! 🎉\n\nYour invite link: [Click Here](${invite_link})`;
    const keyboard = [[{ text: "BACK", callback_data: "main_menu" }]];
    await editMessage(callback_query.message.chat.id, callback_query.message.message_id, message, keyboard);
  } else if (data === "main_menu") {
    const keyboard = [
      [{ text: "🐍 WORM GPT 🐍", callback_data: "worm_gpt" }, { text: "💰 CREDIT 💰", callback_data: "credit" }],
      [{ text: "🔥 DEV 🔥", url: "https://t.me/GOAT_NG" }]
    ];
    await editMessage(callback_query.message.chat.id, callback_query.message.message_id, "💡 Back to the main menu. Choose an option below.", keyboard);
  }
}

async function handleMessage(message) {
  const user_id = message.from.id;
  const text = message.text;

  if (user_data[user_id]?.credits > 0) {
    const api_url = `https://ngyt777gworm.tiiny.io/?question=${encodeURIComponent(text)}`;
    const response = await fetch(api_url);
    let answer = await response.text();

    if (answer.includes("\n")) {
      answer = answer.split("\n")[0];
    }

    if (!answer.includes("```") && (answer.includes("<html>") || answer.includes("<code>") || answer.includes("<script>") || answer.includes("function") || answer.includes("class"))) {
      answer = `\`\`\`\n${answer}\n\`\`\``;
    }

    user_data[user_id].credits -= 1;
    const new_credits = user_data[user_id].credits;
    await sendMessage(user_id, `💡 Answer 💡 \n\n${answer}`);

    const keyboard = [[{ text: "BACK", callback_data: "main_menu" }]];
    if (new_credits > 0) {
      await sendMessage(user_id, `Your remaining credits: ${new_credits} 💰`, keyboard);
    } else {
      const invite_link = `https://t.me/your_bot_username?start=Bot${user_id}`;
      await sendMessage(user_id, `⚠️ Your credits are over.\n\nInvite friends to earn more! 🎉\n\nYour invite link: [Click Here](${invite_link})`, keyboard);
    }
  } else {
    const invite_link = `https://t.me/your_bot_username?start=Bot${user_id}`;
    await sendMessage(user_id, `⚠️ You have no credits left.\n\nInvite friends to earn more! 🚀\n\nYour invite link: [Click Here](${invite_link})`);
  }
}

async function redeemCommand(message) {
  const user_id = message.from.id;

  if (user_id !== ADMIN_ID) {
    await sendMessage(user_id, "❌ You are not authorized to use this command.");
    return;
  }

  const args = message.text.split(' ');
  if (args.length < 3) {
    await sendMessage(user_id, "❌ Invalid format. Use: /redeem <code> (<value>)");
    return;
  }

  const code = args[1];
  const value = parseInt(args[2].replace(/[()]/g, ''));

  redeem_codes[code] = value;
  await sendMessage(user_id, `✅ Redeem code \`${code}\` generated for ${value} credits!`);
}

async function useRedeemCommand(message) {
  const user_id = message.from.id;
  const args = message.text.split(' ');

  if (args.length < 2) {
    await sendMessage(user_id, "❌ Please provide a redeem code.");
    return;
  }

  const code = args[1];
  if (redeem_codes[code]) {
    const value = redeem_codes[code];
    user_data[user_id].credits += value;
    delete redeem_codes[code];
    await sendMessage(user_id, `✅ Redeem successful! Your credits: ${user_data[user_id].credits} 💰`);
  } else {
    await sendMessage(user_id, "❌ Invalid or expired redeem code.");
  }
}

async function sendMessage(chat_id, text, reply_markup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id,
    text,
    reply_markup
  };

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function editMessage(chat_id, message_id, text, reply_markup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
  const body = {
    chat_id,
    message_id,
    text,
    reply_markup
  };

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
