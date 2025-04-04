// Worker code to handle thumbnail fetching
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Handle API endpoint for thumbnail extraction
  if (url.pathname === '/api/get-thumbnail') {
    return handleThumbnailRequest(request)
  }
  
  // Serve the HTML page for all other requests
  return serveHtmlPage()
}

async function handleThumbnailRequest(request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoUrl = searchParams.get('url')
    
    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'Missing video URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }
    
    // Extract video ID from various YouTube URL formats
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    }
    
    // Return thumbnail URLs in different qualities
    const thumbnails = {
      default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    
    return new Response(JSON.stringify(thumbnails), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  }
}

function extractVideoId(url) {
  // Handle various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

async function serveHtmlPage() {
  // Your HTML content goes here
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
  
    <title>YouTube Thumbnail Downloader</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
    <style>
      body {
        font-family: 'Montserrat', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .navbar {
        background-color: #ff0000;
        color: white;
        text-align: center;
        padding: 15px 0;
      }
      #header {
        margin: 0;
        font-size: 28px;
        font-weight: bold;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .form-control {
        width: calc(100% - 22px);
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
        font-family: 'Montserrat', sans-serif;
      }
      #thumbdloadbtn {
        display: block;
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 5px;
        background-color: #ff0000;
        color: white;
        font-size: 16px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
      }
      #thumbdloadbtn:hover {
        background-color: #cc0000;
      }
      footer {
        text-align: center;
        margin-top: 40px;
        color: #666;
      }
      .youtube-logo {
        display: block;
        margin: 20px auto;
        width: 100px;
      }
      .thumbnail-option {
        display: inline-block;
        margin: 10px;
        text-align: center;
        cursor: pointer;
      }
      .thumbnail-option img {
        border: 2px solid #ddd;
        border-radius: 5px;
        transition: border-color 0.3s;
      }
      .thumbnail-option img:hover {
        border-color: #ff0000;
      }
      .thumbnail-quality {
        margin-top: 5px;
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <nav class="navbar">
      <img class="youtube-logo" src="https://www.gstatic.com/youtube/img/branding/youtubelogo/svg/youtubelogo.svg" alt="YouTube Logo">
      <h1 id="header">YOUTUBE THUMBNAIL DOWNLOADER</h1>
    </nav>
  
    <div class="container">
      <input id="ytlink" type="text" class="form-control" placeholder="Enter YouTube Video URL" spellcheck="false">
      <button id="thumbdloadbtn" onclick="downloadThumbnail()">FETCH</button>
      <div id="thumbnail-preview"><!-- Thumbnails will appear here --></div>
  
      <h2>How to Download HD YouTube Thumbnail</h2>
      <ol>
        <li>Copy the YouTube Video Link / URL from the YouTube App or Website</li>
        <li>Paste the YouTube video Link / URL in the Input Field Above</li>
        <li>Click on the "FETCH" Button</li>
        <li>Select the thumbnail quality</li>
        <li>Download the Thumbnail</li>
      </ol>
    </div>
  
    <footer>
      <p>Made With ❤️ By Saeed Ahmed</p>
    </footer>
  
    <script>
      function downloadThumbnail() {
        const videoUrl = document.getElementById('ytlink').value.trim();
        const btn = document.getElementById('thumbdloadbtn');
        
        if (!videoUrl) {
          alert('Please enter a YouTube video URL');
          return;
        }
        
        btn.textContent = 'Fetching...';
        btn.disabled = true;
        
        fetch(`/api/get-thumbnail?url=${encodeURIComponent(videoUrl)}`)
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              throw new Error(data.error);
            }
            
            displayThumbnails(data);
            btn.textContent = 'FETCH';
            btn.disabled = false;
          })
          .catch(error => {
            alert(error.message);
            btn.textContent = 'FETCH';
            btn.disabled = false;
          });
      }
      
      function displayThumbnails(thumbnails) {
        const container = document.getElementById('thumbnail-preview');
        container.innerHTML = '<h3>Select Thumbnail Quality:</h3>';
        
        for (const [quality, url] of Object.entries(thumbnails)) {
          const option = document.createElement('div');
          option.className = 'thumbnail-option';
          option.onclick = () => window.open(url, '_blank');
          
          option.innerHTML = `
            <img src="${url}" alt="${quality} quality" width="120">
            <div class="thumbnail-quality">${quality.toUpperCase()}</div>
            <small>Click to download</small>
          `;
          
          container.appendChild(option);
        }
      }
      
      // Helper function to extract video ID (not needed here as server handles it)
      function extractVideoId(url) {
        return null;
      }
    </script>
  </body>
  </html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
