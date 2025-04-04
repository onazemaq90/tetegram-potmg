addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // AI-powered time calculation (demonstration)
  const aiCalculateTime = () => {
    const now = new Date();
    // India is UTC+5:30
    const offset = 5.5 * 60 * 60 * 1000;
    const indiaTime = new Date(now.getTime() + offset);
    return indiaTime;
  };

  const options = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  const time = aiCalculateTime();
  const indiaTime = time.toLocaleTimeString('en-IN', options);
  const date = time.toLocaleDateString('en-IN');

  // 3D CSS with colorful gradient
  const html = `<!DOCTYPE html>
  <html>
  <head>
    <title>AI-Powered India Time</title>
    <style>
      :root {
        --primary: #ff7e5f;
        --secondary: #feb47b;
        --accent: #6a11cb;
      }
      
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background: linear-gradient(135deg, var(--accent) 0%, #2575fc 100%);
        font-family: 'Arial', sans-serif;
        color: white;
        perspective: 1000px;
        overflow: hidden;
      }
      
      .scene {
        width: 300px;
        height: 400px;
        position: relative;
        transform-style: preserve-3d;
        animation: rotate 20s infinite linear;
      }
      
      .time-card {
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, var(--primary), var(--secondary));
        border-radius: 20px;
        padding: 2rem;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        transform-style: preserve-3d;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      
      .time {
        font-size: 3.5rem;
        font-weight: bold;
        text-shadow: 0 5px 15px rgba(0,0,0,0.2);
        transform: translateZ(50px);
        margin: 1rem 0;
      }
      
      .date {
        font-size: 1.2rem;
        transform: translateZ(30px);
        opacity: 0.8;
      }
      
      .label {
        font-size: 1.5rem;
        transform: translateZ(40px);
        margin-bottom: 2rem;
      }
      
      @keyframes rotate {
        0% { transform: rotateY(0); }
        100% { transform: rotateY(360deg); }
      }
      
      /* Particle background */
      .particles {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
    </style>
  </head>
  <body>
    <div class="scene">
      <div class="time-card">
        <div class="label">AI-Powered Time</div>
        <div class="time">${indiaTime}</div>
        <div class="date">${date}</div>
      </div>
    </div>
    
    <canvas class="particles"></canvas>
    
    <script>
      // Auto-refresh
      setTimeout(() => location.reload(), 1000);
      
      // 3D Particles background
      const canvas = document.querySelector('.particles');
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const particles = [];
      const colors = ['#ff7e5f', '#feb47b', '#6a11cb', '#2575fc'];
      
      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 5 + 1;
          this.color = colors[Math.floor(Math.random() * colors.length)];
          this.speedX = Math.random() * 3 - 1.5;
          this.speedY = Math.random() * 3 - 1.5;
        }
        
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
          
          if (this.size > 0.2) this.size -= 0.1;
          if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
          if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      function init() {
        for (let i = 0; i < 50; i++) {
          particles.push(new Particle());
        }
      }
      
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
          
          if (particles[i].size <= 0.2) {
            particles.splice(i, 1);
            particles.push(new Particle());
          }
        }
        
        requestAnimationFrame(animate);
      }
      
      init();
      animate();
    </script>
  </body>
  </html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
