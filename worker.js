const BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';
const ADMIN_ID = '7912527708';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Utility to send Telegram messages
async function sendMessage(chatId, text, replyMarkup = null) {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup: replyMarkup ? { inline_keyboard: replyMarkup } : undefined,
      parse_mode: "Markdown",
    }),
  });
  return response.json();
}

// Utility to edit messages
async function editMessage(chatId, messageId, text, replyMarkup = null) {
  const response = await fetch(`${TELEGRAM_API}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      reply_markup: replyMarkup ? { inline_keyboard: replyMarkup } : undefined,
      parse_mode: "Markdown",
    }),
  });
  return response.json();
}

// Fetch or initialize data from KV
async function getData(key, defaultValue) {
  const value = await BOT_STORAGE.get(key);
  return value ? JSON.parse(value) : defaultValue;
}

async function setData(key, value) {
  await BOT_STORAGE.put(key, JSON.stringify(value));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/webhook") return new Response("Not Found", { status: 404 });

    const update = await request.json();
    const userId = update.message?.from?.id || update.callback_query?.from.id;
    const chatId = update.message?.chat.id || update.callback_query?.message.chat.id;

    // Initialize data
    let userData = await getData("user_data", {});
    let redeemCodes = await getData("redeem_codes", {});
    let liveMemberCount = await getData("live_member_count", 0);

    // Handle /start command
    if (update.message?.text?.startsWith("/start")) {
      const args = update.message.text.split(" ").slice(1);
      const userName = update.message.from.first_name;
      const referrerId = args[0]?.replace("Bot", "") || null;

      if (referrerId && Number(referrerId) !== userId) {
        if (!userData[userId]) {
          userData[userId] = { credits: 3, referrer: Number(referrerId) };
          userData[referrerId] = userData[referrerId] || { credits: 3, referrer: null };
          userData[referrerId].credits += 1;
          await sendMessage(referrerId, "🎉 Someone joined using your invite! You earned +1 credit. 💰");
        }
      }

      if (!userData[userId]) {
        userData[userId] = { credits: 3, referrer: null };
        liveMemberCount += 1;
      }

      const inviteLink = `https://t.me/${env.BOT_USERNAME}?start=Bot${userId}`;
      const welcomeMsg = `👋 Welcome, ${userName} 🎉\n\n💡 Explore the bot options below.\n__________________________`;
      const keyboard = [
        [
          { text: "🐍 WORM GPT 🐍", callback_data: "worm_gpt" },
          { text: "💰 CREDIT 💰", callback_data: "credit" },
        ],
        [{ text: "🔥 DEV 🔥", url: "https://t.me/GOAT_NG" }],
      ];
      await sendMessage(chatId, welcomeMsg, keyboard);
      await setData("user_data", userData);
      await setData("live_member_count", liveMemberCount);
    }

    // Handle button clicks
    if (update.callback_query) {
      const query = update.callback_query;
      const data = query.data;
      const messageId = query.message.message_id;

      if (data === "worm_gpt") {
        const keyboard = [[{ text: "BACK", callback_data: "main_menu" }]];
        await editMessage(chatId, messageId, "💬 Ask your query below:", keyboard);
      } else if (data === "credit") {
        const credits = userData[userId]?.credits || 0;
        const inviteLink = `https://t.me/${env.BOT_USERNAME}?start=Bot${userId}`;
        const message = `💰 Your Credits: ${credits}\n\n📊 Total Members: ${liveMemberCount}\n\nInvite friends to earn more credits! 🎉\n\nYour invite link: [Click Here](${inviteLink})`;
        const keyboard = [[{ text: "BACK", callback_data: "main_menu" }]];
        await editMessage(chatId, messageId, message, keyboard);
      } else if (data === "main_menu") {
        const keyboard = [
          [
            { text: "🐍 WORM GPT 🐍", callback_data: "worm_gpt" },
            { text: "💰 CREDIT 💰", callback_data: "credit" },
          ],
          [{ text: "🔥 DEV 🔥", url: "https://t.me/GOAT_NG" }],
        ];
        await editMessage(chatId, messageId, "💡 Back to the main menu. Choose an option below.", keyboard);
      }
    }

    // Handle text messages
    if (update.message?.text && !update.message.text.startsWith("/")) {
      const text = update.message.text;
      if (userData[userId]?.credits > 0) {
        const apiUrl = `https://ngyt777gworm.tiiny.io/?question=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        let answer = await response.text();
        answer = answer.split("\n")[0]; // Take first line if multiple

        if (!answer.includes("```") && /<html>|<code>|<script>|function|class/i.test(answer)) {
          answer = "```\n" + answer + "\n```";
        }

        userData[userId].credits -= 1;
        const newCredits = userData[userId].credits;
        await sendMessage(chatId, `💡 Answer 💡 \n\n${answer}`);
        const keyboard = [[{ text: "BACK", callback_data: "main_menu" }]];
        if (newCredits > 0) {
          await sendMessage(chatId, `Your remaining credits: ${newCredits} 💰`, keyboard);
        } else {
          const inviteLink = `https://t.me/${env.BOT_USERNAME}?start=Bot${userId}`;
          await sendMessage(chatId, `⚠️ Your credits are over.\n\nInvite friends to earn more! 🎉\n\nYour invite link: [Click Here](${inviteLink})`, keyboard);
        }
        await setData("user_data", userData);
      } else {
        const inviteLink = `https://t.me/${env.BOT_USERNAME}?start=Bot${userId}`;
        await sendMessage(chatId, `⚠️ You have no credits left.\n\nInvite friends to earn more! 🚀\n\nYour invite link: [Click Here](${inviteLink})`);
      }
    }

    // Handle /redeem (admin only)
    if (update.message?.text?.startsWith("/redeem") && userId === Number(env.ADMIN_ID)) {
      const args = update.message.text.split(" ").slice(1);
      const [code, value] = args;
      if (code && value) {
        redeemCodes[code] = Number(value.replace(/[()]/g, ""));
        await sendMessage(chatId, `✅ Redeem code \`${code}\` generated for ${value} credits!`);
        await setData("redeem_codes", redeemCodes);
      } else {
        await sendMessage(chatId, "❌ Invalid format. Use: /redeem <code> (<value>)");
      }
    }

    // Handle /use_redeem
    if (update.message?.text?.startsWith("/use_redeem")) {
      const args = update.message.text.split(" ").slice(1);
      const code = args[0];
      if (code && redeemCodes[code]) {
        const value = redeemCodes[code];
        delete redeemCodes[code];
        userData[userId].credits = (userData[userId]?.credits || 0) + value;
        await sendMessage(chatId, `✅ Redeem successful! Your credits: ${userData[userId].credits} 💰`);
        await setData("redeem_codes", redeemCodes);
        await setData("user_data", userData);
      } else {
        await sendMessage(chatId, "❌ Invalid or expired redeem code.");
      }
    }

    return new Response("OK", { status: 200 });
  },
};
