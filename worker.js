export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const country = url.searchParams.get('country') || 'india';
    const editMode = url.searchParams.get('edit') === 'true';
    const devChannel = "https://discord.gg/your-dev-channel"; // Replace with your actual channel

    // Time zone configuration
    const timeZones = {
      india: { zone: 'Asia/Kolkata', name: 'Indian Standard Time', flag: '🇮🇳' },
      us: { zone: 'America/New_York', name: 'Eastern Time (US)', flag: '🇺🇸' },
      uk: { zone: 'Europe/London', name: 'UK Time', flag: '🇬🇧' },
      japan: { zone: 'Asia/Tokyo', name: 'Japan Standard Time', flag: '🇯🇵' }
    };

    const currentTz = timeZones[country] || timeZones.india;
    const options = {
      timeZone: currentTz.zone,
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const localTime = new Date().toLocaleString('en-US', options);

    // Dynamic CSS for edit mode
    const editModeStyles = editMode ? `
      .editable {
        background: rgba(255, 255, 0, 0.1);
        outline: 2px dashed rgba(255, 255, 0, 0.3);
        padding: 5px;
        margin: 5px 0;
      }
      .edit-controls {
        display: block !important;
      }
    ` : '';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>🌐 Smart Time Display | AI Developer Edition</title>
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
          position: relative;
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
          flex-wrap: wrap;
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
        
        .dev-panel {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          gap: 10px;
        }
        
        .dev-btn {
          background: rgba(0, 0, 0, 0.3);
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }
        
        .edit-controls {
          display: none;
          margin-top: 20px;
          background: rgba(0, 0, 0, 0.5);
          padding: 15px;
          border-radius: 10px;
        }
        
        .ai-channel-link {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(106, 17, 203, 0.7);
          color: white;
          padding: 10px 15px;
          border-radius: 30px;
          text-decoration: none;
          font-weight: bold;
          box-shadow: 0 0 15px rgba(106, 17, 203, 0.5);
          transition: all 0.3s;
        }
        
        .ai-channel-link:hover {
          background: rgba(106, 17, 203, 0.9);
          transform: translateY(-3px);
        }
        
        ${editModeStyles}
        
        @keyframes float {
          0% { transform: translateY(0px) rotateY(0deg); }
          50% { transform: translateY(-20px) rotateY(5deg); }
          100% { transform: translateY(0px) rotateY(0deg); }
        }
      </style>
    </head>
    <body>
      <div class="time-container">
        <!-- Developer controls -->
        <div class="dev-panel">
          <button class="dev-btn" title="Toggle Edit Mode" onclick="toggleEditMode()">✏️</button>
          <button class="dev-btn" title="Copy Page URL" onclick="copyPageUrl()">🔗</button>
        </div>
        
        <h1 class="editable" id="title">${currentTz.name} ${currentTz.flag}</h1>
        <div class="time editable" id="time-display">${localTime.split(',')[1]}</div>
        <div class="date editable" id="date-display">${localTime.split(',')[0]}</div>
        
        <div class="country-buttons">
          ${Object.entries(timeZones).map(([key, tz]) => `
            <button 
              class="country-btn ${country === key ? 'active' : ''}" 
              onclick="updateCountry('${key}')"
            >
              ${tz.flag} ${key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          `).join('')}
        </div>
        
        <div class="edit-controls" id="edit-controls">
          <h3>Edit Mode</h3>
          <div>
            <label for="title-edit">Title:</label>
            <input type="text" id="title-edit" value="${currentTz.name} ${currentTz.flag}" style="width: 100%; padding: 5px; margin: 5px 0;">
          </div>
          <div>
            <label for="time-edit">Time Format:</label>
            <select id="time-format" style="padding: 5px; margin: 5px 0; width: 100%;">
              <option value="12">12-hour format</option>
              <option value="24">24-hour format</option>
            </select>
          </div>
          <button onclick="saveEdits()" style="padding: 8px 15px; margin-top: 10px;">Save Changes</button>
        </div>
        
        <div class="hacker-text">// Cloudflare Worker | AI Developer Edition | ${new Date().getFullYear()}</div>
      </div>
      
      <a href="${devChannel}" class="ai-channel-link" target="_blank">Join AI Dev Channel</a>
      
      <script>
        // 3D tilt effect
        document.addEventListener('mousemove', (e) => {
          const container = document.querySelector('.time-container');
          const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
          const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
          container.style.transform = \`rotateY(\${xAxis}deg) rotateX(\${yAxis}deg)\`;
        });
        
        // Developer functions
        function toggleEditMode() {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('edit', currentUrl.searchParams.get('edit') === 'true' ? 'false' : 'true');
          window.location.href = currentUrl.toString();
        }
        
        function updateCountry(country) {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('country', country);
          window.location.href = currentUrl.toString();
        }
        
        function copyPageUrl() {
          navigator.clipboard.writeText(window.location.href);
          alert('Page URL copied to clipboard!');
        }
        
        function saveEdits() {
          const newTitle = document.getElementById('title-edit').value;
          document.getElementById('title').textContent = newTitle;
          
          const timeFormat = document.getElementById('time-format').value;
          // Here you would implement time format changes
          // This would require more complex time handling
          
          alert('Changes saved (note: changes are client-side only in this demo)');
        }
        
        // Update time every second
        function updateTime() {
          const now = new Date();
          const options = { 
            timeZone: '${currentTz.zone}',
            hour12: ${options.hour12},
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
          };
          document.getElementById('time-display').textContent = now.toLocaleTimeString('en-US', options);
          
          const dateOptions = {
            timeZone: '${currentTz.zone}',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          };
          document.getElementById('date-display').textContent = now.toLocaleDateString('en-US', dateOptions);
        }
        
        setInterval(updateTime, 1000);
      </script>
    </body>
    </html>
    `;
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
};
