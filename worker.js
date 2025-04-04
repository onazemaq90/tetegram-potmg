// index.js for your Cloudflare Worker
export default {
  async fetch(request, env) {
    // Set Indian time zone
    const options = {
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
    
    const indianTime = new Date().toLocaleString('en-IN', options);
    
    // Create a colorful 3D-inspired page
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>🕒 Indian Time | 3D Web Dev</title>
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
        
        .ai-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 210, 255, 0.2);
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
        }
      </style>
    </head>
    <body>
      <div class="time-container">
        <div class="ai-badge">AI ☄️ Hacker Edition</div>
        <h1>Indian Standard Time</h1>
        <div class="time">${indianTime.split(',')[1]}</div>
        <div class="date">${indianTime.split(',')[0]}</div>
        <div class="hacker-text">// Cloudflare Worker powered | 3D CSS transforms | ${new Date().getFullYear()}</div>
      </div>
      
      <script>
        // Simple 3D tilt effect
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
