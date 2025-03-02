// Replace with your Telegram bot token
const TELEGRAM_BOT_TOKEN = '7286429810:AAGZ4Ban1Q5jh7DH_FKg_ROgMndXpwkpRO4';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json();
    if (update.message && update.message.text) {
      return handleMessage(update.message);
    }
  }
  return new Response('OK');
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = message.text;

  if (text.startsWith('/fake')) {
    try {
      // Fetch fake profile data
      const response = await fetch('http://randomprofile.com/api/api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'countries=CHN,JPN&fromAge=20&toAge=40&format=xml&fullChildren=1'
      });

      const xmlData = await response.text();
      const profile = parseXmlProfile(xmlData);

      // Format response message
      const reply = `🔍 Fake Profile Generated:
      
📌 Name: ${profile.firstname} ${profile.lastname}
🎂 Age: ${profile.age}
📍 Country: ${profile.country}
📧 Email: ${profile.email}
📱 Phone: ${profile.mobile}`;

      await sendTelegramMessage(chatId, reply);
    } catch (error) {
      await sendTelegramMessage(chatId, '❌ Error generating profile. Please try again later.');
    }
  } else {
    await sendTelegramMessage(chatId, 'Send /fake to generate a random profile');
  }

  return new Response('OK');
}

function parseXmlProfile(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  
  return {
    firstname: xmlDoc.querySelector('firstname').textContent,
    lastname: xmlDoc.querySelector('lastname').textContent,
    age: xmlDoc.querySelector('age').textContent,
    country: xmlDoc.querySelector('country').textContent,
    email: xmlDoc.querySelector('email').textContent,
    mobile: xmlDoc.querySelector('mobile').textContent
  };
}

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}
