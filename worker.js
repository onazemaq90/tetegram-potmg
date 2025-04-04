export default {
  async fetch(request, env) {
    // Parse URL to check for country parameter
    const url = new URL(request.url);
    const country = url.searchParams.get('country') || 'india';
    
    // Set time options based on country
    let options, timeZoneName;
    if (country === 'us') {
      options = {
        timeZone: 'America/New_York',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      timeZoneName = 'Eastern Time (US)';
    } else { // Default to India
      options = {
        timeZone: 'Asia/Kolkata',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      timeZoneName = 'Indian Standard Time';
    }
    
    const localTime = new Date().toLocaleString('en-US', options);
    
    // Create HTML with toggle button
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>🌐 World Time | 3D Web Dev</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          color: white;
          text-align: center;
          margin: 0;
          padding: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          perspective: 1000px;
        }
        
        .time-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          width: 80%;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transform-style: preserve-3d;
          animation: float 6s ease-in-out infinite;
        }
        
        .time {
          font-size: 3rem;
          margin: 1rem 0;
          color: #ff8a00;
          text-shadow: 0 0 10px rgba(255, 138, 0, 0.7);
          transform: translateZ(50px);
        }
        
        .date {
          font-size: 1.5rem;
          color: #00d2ff;
          transform: translateZ(30px);
        }
        
        .country-buttons {
          margin: 20px 0;
          display: flex;
          justify-content: center;
          gap: 15px;
        }
        
        .country-btn {
          background: rgba(0, 210, 255, 0.3);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 30px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .country-btn:hover {
          background: rgba(0, 210, 255, 0.5);
          transform: translateY(-3px);
        }
        
        .country-btn.active {
          background: rgba(255, 138, 0, 0.7);
          box-shadow: 0 0 15px rgba(255, 138, 0, 0.5);
        }
        
        .hacker-text {
          font-family: 'Courier New', monospace;
          color: lime;
          margin-top: 2rem;
          font-size: 0.9rem;
          opacity: 0.7;
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotateY(0deg); }
          50% { transform: translateY(-20px) rotateY(5deg); }
          100% { transform: translateY(0px) rotateY(0deg); }
        }
      </style>
    </head>
    <body>
      <div class="time-container">
        <h1>${timeZoneName}</h1>
        <div class="time">${localTime.split(',')[1]}</div>
        <div class="date">${localTime.split(',')[0]}</div>
        
        <div class="country-buttons">
          <button 
            class="country-btn ${country === 'india' ? 'active' : ''}" 
            onclick="window.location.href='?country=india'"
          >
            🇮🇳 India
          </button>
          <button 
            class="country-btn ${country === 'us' ? 'active' : ''}" 
            onclick="window.location.href='?country=us'"
          >
            🇺🇸 US
          </button>
        </div>
        
        <div class="hacker-text">// Cloudflare Worker | Time API | ${new Date().getFullYear()}</div>
      </div>
      
      <script>
        // 3D tilt effect
        document.addEventListener('mousemove', (e) => {
          const container = document.querySelector('.time-container');
          const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
          const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
          container.style.transform = \`rotateY(\${xAxis}deg) rotateX(\${yAxis}deg)\`;
        });
      </script>
    </body>
    </html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
};
