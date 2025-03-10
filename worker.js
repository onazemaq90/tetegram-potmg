export default {
    async fetch(request) {
        const BOT_TOKEN = "7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4"; // Replace with your bot token
        const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
        const REQUIRED_CHANNEL = "@lt_MrVirus"; // Replace with your actual channel
        const REFERRAL_POINTS = 1; // Points given per referral

        if (request.method === "POST") {
            let update = await request.json();

            if (update.message) {
                let chatId = update.message.chat.id;
                let text = update.message.text;
                let userId = update.message.from.id;
                let userName = update.message.from.first_name || "User";

                // Handle /start command
                if (text === "/start") {
                    let joinButtons = {
                        inline_keyboard: [
                            [
                                { text: "🚀 Join Channel 1", url: "https://t.me/Starxnetwork" },
                                { text: "🚀 Join Channel 2", url: "https://t.me/starxbackup" }
                            ],
                            [
                                { text: "🚀 Join Support", url: "https://t.me/StarX_Support" },
                                { text: "🚀 Updates", url: "https://t.me/+lJ3m8WWL5-BkN2Y1" }
                            ],
                            [
                                { text: "✅ Joined ✅", callback_data: "/joined" }
                            ]
                        ]
                    };

                    let messageText = `*🙋‍♂ Welcome* [${userName}](tg://user?id=${userId})\n\n` +
                        "🔎 *You must join our channels before using this bot.*\n\n" +
                        "📢 *Click the buttons below to join the required channels.*\n" +
                        "✅ After joining, click the **'Joined'** button.";

                    await fetch(`${API_URL}/sendPhoto`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            chat_id: chatId,
                            photo: "https://t.me/STAR_X_BACKUP/66", // Replace with a valid image
                            caption: messageText,
                            reply_markup: joinButtons,
                            parse_mode: "Markdown"
                        })
                    });

                    return new Response("Start message sent", { status: 200 });
                }

                // Handle /joined button click
                if (text === "/joined") {
                    let chatMemberResponse = await fetch(`${API_URL}/getChatMember?chat_id=${REQUIRED_CHANNEL}&user_id=${userId}`);
                    let chatMemberData = await chatMemberResponse.json();

                    if (chatMemberData.ok) {
                        let userStatus = chatMemberData.result.status;
                        if (["member", "administrator", "creator"].includes(userStatus)) {
                            await fetch(`${API_URL}/sendMessage`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: "*✅ Welcome!*\nYou have successfully joined the channel.",
                                    parse_mode: "Markdown"
                                })
                            });

                            return new Response("User verified", { status: 200 });
                        } else {
                            await fetch(`${API_URL}/sendMessage`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: "*⚠️ Channel Subscription Required*\n\n" +
                                        "Please join our channel to use this bot:\n" +
                                        `${REQUIRED_CHANNEL}\n\n` +
                                        "After joining, type /start again.",
                                    parse_mode: "Markdown"
                                })
                            });

                            return new Response("User not in the channel", { status: 403 });
                        }
                    } else {
                        await fetch(`${API_URL}/sendMessage`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                chat_id: chatId,
                                text: "*❌ Access Denied*\n\nSomething went wrong. Please try again or contact support.",
                                parse_mode: "Markdown"
                            })
                        });

                        return new Response("Error checking membership", { status: 500 });
                    }
                }

                // Handle /mainmenu command
                if (text === "/mainmenu") {
                    let chatMemberResponse = await fetch(`${API_URL}/getChatMember?chat_id=${REQUIRED_CHANNEL}&user_id=${userId}`);
                    let chatMemberData = await chatMemberResponse.json();

                    if (chatMemberData.ok) {
                        let userStatus = chatMemberData.result.status;

                        if (["member", "administrator", "creator"].includes(userStatus)) {
                            // Handle referral system
                            let userReferrals = {}; // Simulated referral storage
                            let referrerId = userReferrals[userId];

                            if (referrerId && !userReferrals[`${userId}_referred`]) {
                                if (!userReferrals[referrerId]) {
                                    userReferrals[referrerId] = 0;
                                }
                                userReferrals[referrerId] += REFERRAL_POINTS;
                                userReferrals[`${userId}_referred`] = true;

                                await fetch(`${API_URL}/sendMessage`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        chat_id: referrerId,
                                        text: `🎉 You have received *${REFERRAL_POINTS} Point(s)* from ${userName}!`,
                                        parse_mode: "Markdown"
                                    })
                                });
                            }

                            let keyboard = {
                                keyboard: [
                                    ["🥵 CP (Por) 🥵", "🥵 CP 2 (Por) 🥵"],
                                    ["📌 POR 1", "📌 POR 2"],
                                    ["📌 POR 3", "📌 POR 4"]
                                ],
                                resize_keyboard: true
                            };

                            await fetch(`${API_URL}/sendMessage`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: "*🔥 WELCOME TO THE BOT 🔥*",
                                    reply_markup: keyboard,
                                    parse_mode: "Markdown"
                                })
                            });

                            return new Response("Main menu sent", { status: 200 });
                        } else {
                            await fetch(`${API_URL}/sendMessage`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    chat_id: chatId,
                                    text: "*⚠️ Channel Subscription Required*\n\n" +
                                        "Please join our channel to use this bot:\n" +
                                        `${REQUIRED_CHANNEL}\n\n` +
                                        "After joining, type /start again.",
                                    parse_mode: "Markdown"
                                })
                            });

                            return new Response("User not in channel", { status: 403 });
                        }
                    }
                }

                // Default response for other messages
                await fetch(`${API_URL}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `You said: ${text}`
                    })
                });

                return new Response("Message sent", { status: 200 });
            }
        }

        return new Response("Invalid request", { status: 400 });
    }
};
