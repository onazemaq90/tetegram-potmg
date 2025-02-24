addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const TELEGRAM_API = "https://api.telegram.org/bot";
const BOT_TOKEN = "7286429810:AAHBzO7SFy6AjYv8avTRKWQg53CJpD2KEbM"; // Replace with your bot token or use env.BOT_TOKEN
const WORKER_URL = "https://<your-worker>.workers.dev"; // Replace with your Worker URL

async function handleRequest(request) {
  const url = new URL(request.url);

  // Set Telegram webhook
  if (url.pathname === "/setWebhook") {
    const webhookUrl = `${WORKER_URL}/webhook`;
    await fetch(`${TELEGRAM_API}${BOT_TOKEN}/setWebhook?url=${webhookUrl}`);
    return new Response("Webhook set successfully!", { status: 200 });
  }

  // Handle Telegram webhook updates
  if (url.pathname === "/webhook" && request.method === "POST") {
    const update = await request.json();
    const chatId = update.message?.chat?.id;
    const text = update.message?.text || "";

    if (!chatId) return new Response("No chat ID", { status: 400 });

    // Command handlers
    if (text.startsWith("/chk")) {
      await checkCredentials(chatId, text);
    } else if (text.startsWith("/txt")) {
      await handleTextFile(chatId, update);
    } else if (text === "/get fire.txt") {
      await sendResults(chatId);
    } else {
      await sendMessage(chatId, "Use /chk <email:pass> to check credentials or /txt to upload a text file.");
    }
    return new Response("OK", { status: 200 });
  }

  return new Response("Welcome to the Telegram Bot!", { status: 200 });
}

// Send a message to Telegram
async function sendMessage(chatId, text) {
  const url = `${TELEGRAM_API}${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  });
}

// Microsoft Checker Logic (Simulated)
async function microsoftChecker(email, password) {
  const emailDomain = email.split("@")[1]?.toLowerCase();
  const isEdu = emailDomain?.endsWith(".edu");
  const isOutlook = emailDomain === "outlook.com";
  const isHotmail = emailDomain === "hotmail.com";

  // Simulate credential check (replace with real API logic if desired)
  const isValid = Math.random() > 0.5; // Random success/failure for demo

  return {
    email,
    password,
    isEdu,
    isOutlook,
    isHotmail,
    isValid,
  };
}

// Check Credentials (/chk command)
async function checkCredentials(chatId, text) {
  const parts = text.split(" ");
  if (parts.length < 2) {
    await sendMessage(chatId, "Usage: /chk <email:password>");
    return;
  }

  const [email, password] = parts[1].split(":");
  if (!email || !password) {
    await sendMessage(chatId, "Invalid format. Use: /chk <email:password>");
    return;
  }

  const startTime = Date.now();
  const result = await microsoftChecker(email, password);
  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

  const response = `
☣️ <b>Credential Check Results</b> ☣️
➾ 📧 Email: ${result.email}
➾ 🔑 Password: ${result.password}
➾ 🎓 EDU: ${result.isEdu ? "Yes" : "No"}
➾ 🌐 Outlook: ${result.isOutlook ? "Yes" : "No"}
➾ 🔥 Hotmail: ${result.isHotmail ? "Yes" : "No"}
➾ ✅ Status: ${result.isValid ? "Valid" : "Invalid"}
➾ 🕛 Time Taken: ${timeTaken} seconds
🔑 <b>Access Key:</b> /get fire.txt
`;
  await sendMessage(chatId, response);
}

// Handle Text File Upload (/txt command)
async function handleTextFile(chatId, update) {
  const document = update.message?.document;
  if (!document) {
    await sendMessage(chatId, "Please upload a text file after /txt command.");
    return;
  }

  const fileId = document.file_id;
  const fileUrl = await getFileUrl(fileId);
  const fileContent = await fetch(fileUrl).then((res) => res.text());
  const credentials = fileContent.split("\n").filter((line) => line.includes(":"));

  const startTime = Date.now();
  let hits = 0;
  let bad = 0;
  const results = [];

  for (const line of credentials) {
    const [email, password] = line.split(":");
    if (email && password) {
      const result = await microsoftChecker(email, password);
      results.push(result);
      if (result.isValid) hits++;
      else bad++;
    }
  }

  const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
  const total = hits + bad;

  const response = `
✅ <b>Results</b> ✅
➾ 📝 Total = ${total}
➾ 🟢 Hits = ${hits}
➾ 🔴 Bad = ${bad}
➾ 🕛 Time Taken = ${timeTaken} seconds
🔑 <b>Access Key:</b> /get fire.txt
☣️ <b>Processed by Microsoft Checker</b> ☣️
`;

  await sendMessage(chatId, response);
  await storeResults(chatId, results); // Store results for later access
}

// Get Telegram file URL
async function getFileUrl(fileId) {
  const response = await fetch(`${TELEGRAM_API}${BOT_TOKEN}/getFile?file_id=${fileId}`);
  const data = await response.json();
  const filePath = data.result.file_path;
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
}

// Store results (simulated KV storage)
const resultsStorage = new Map(); // Replace with Cloudflare KV in production
async function storeResults(chatId, results) {
  resultsStorage.set(chatId, results);
}

// Send stored results (/get fire.txt command)
async function sendResults(chatId) {
  const results = resultsStorage.get(chatId);
  if (!results || results.length === 0) {
    await sendMessage(chatId, "No results found. Run /txt first.");
    return;
  }

  let output = "☣️ <b>Full Results</b> ☣️\n";
  results.forEach((result) => {
    output += `
➾ 📧 ${result.email} | ${result.isValid ? "🟢 Valid" : "🔴 Invalid"}
   🎓 EDU: ${result.isEdu ? "Yes" : "No"} | 🌐 Outlook: ${result.isOutlook ? "Yes" : "No"} | 🔥 Hotmail: ${result.isHotmail ? "Yes" : "No"}
`;
  });

  await sendMessage(chatId, output);
}
