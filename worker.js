addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get current time in India (IST - UTC+5:30)
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  const indiaTime = new Date().toLocaleTimeString('en-IN', options);
  
  // Create colorful HTML response
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>India Time</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .time-container {
          text-align: center;
          padding: 2rem;
          border-radius: 15px;
          background: white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .time {
          font-size: 3rem;
          font-weight: bold;
          background: linear-gradient(to right, #ff8a00, #e52e71);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          margin: 0.5rem 0;
        }
        .label {
          font-size: 1.2rem;
          color: #666;
          margin-bottom: 1rem;
        }
        .emoji {
          font-size: 2rem;
        }
      </style>
    </head>
    <body>
      <div class="time-container">
        <div class="emoji">🇮🇳</div>
        <div class="label">Current Time in India</div>
        <div class="time">${indiaTime}</div>
      </div>
    </body>
    </html>
  `;
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
