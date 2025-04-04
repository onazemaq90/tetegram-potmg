export default {
  async fetch(request, env) {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Crunchyroll</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f78a1e;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
          }
          .logo-container {
            text-align: center;
          }
          .logo {
            width: 300px;
            height: auto;
          }
          .tagline {
            color: white;
            font-size: 24px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          <svg class="logo" viewBox="0 0 595 168" xmlns="http://www.w3.org/2000/svg">
            <path d="M120.5 42.1h-13.3v83.7h13.3zM164.9 125.8h13.3V42.1h-13.3zM164.9 125.8" fill="#fff"/>
            <path d="M0 42.1h13.3v83.7H0zM44.4 125.8h13.3V42.1H44.4zM44.4 125.8" fill="#fff"/>
            <path d="M213.6 42.1h-13.3v83.7h13.3zM258 125.8h13.3V42.1H258zM258 125.8" fill="#fff"/>
            <path d="M302.4 42.1h-13.3v83.7h13.3zM346.8 125.8h13.3V42.1h-13.3zM346.8 125.8" fill="#fff"/>
            <path d="M391.2 42.1h-13.3v83.7h13.3zM435.6 125.8h13.3V42.1h-13.3zM435.6 125.8" fill="#fff"/>
            <path d="M480 42.1h-13.3v83.7H480zM524.4 125.8h13.3V42.1h-13.3zM524.4 125.8" fill="#fff"/>
            <path d="M568.8 42.1h-13.3v83.7h13.3zM595 125.8V42.1h-13.3v83.7zM595 125.8" fill="#fff"/>
            <path d="M82.4 42.1H69.1v83.7h13.3zM126.8 125.8h13.3V42.1h-13.3zM126.8 125.8" fill="#fff"/>
          </svg>
          <div class="tagline">The Ultimate Anime Experience</div>
        </div>
      </body>
      </html>
    `, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};
