// index.js for your Cloudflare Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route handling
    if (url.pathname === '/login' && request.method === 'POST') {
      return handleLogin(request);
    }
    
    if (url.pathname === '/watch') {
      return new Response(videoPageHTML(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Default to login page
    return new Response(loginPageHTML(), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

function handleLogin(request) {
  // Redirect to watch page after "login"
  return Response.redirect(new URL('/watch', request.url), 302);
}

function loginPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crunchyroll - Login</title>
    <style>
        /* Previous login page styles */
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            max-width: 400px;
            margin: 50px auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        /* ... rest of your login page styles ... */
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://www.crunchyroll.com/build/assets/img/logo.png" alt="Crunchyroll Logo">
        </div>
        <h1>Log In to Your Account</h1>
        <form action="/login" method="POST">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <div class="checkbox">
                <input type="checkbox" id="remember" name="remember">
                <label for="remember">Remember me</label>
            </div>
            <button type="submit">Log In</button>
        </form>
        <div class="links">
            <a href="#">Forgot password?</a>
            <a href="#">Sign up</a>
        </div>
        <div class="footer">
            <p>© Crunchyroll, LLC (This is a demo only)</p>
        </div>
    </div>
</body>
</html>`;
}

function videoPageHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Attack on Titan | Crunchyroll</title>
    <style>
        :root {
            --primary-color: #f47521;
            --dark-bg: #121212;
            --light-text: #ffffff;
            --dark-text: #333333;
        }
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            background-color: var(--dark-bg);
            color: var(--light-text);
        }
        
        .header {
            background-color: rgba(0, 0, 0, 0.8);
            padding: 15px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: fixed;
            width: 100%;
            z-index: 100;
            box-sizing: border-box;
        }
        
        .logo img {
            height: 30px;
        }
        
        .nav-links a {
            color: var(--light-text);
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
        }
        
        .user-menu {
            display: flex;
            align-items: center;
        }
        
        .search-icon, .user-icon {
            margin-left: 20px;
            cursor: pointer;
        }
        
        .video-container {
            padding-top: 60px;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .video-player {
            width: 100%;
            aspect-ratio: 16/9;
            background-color: #000;
            position: relative;
        }
        
        .video-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 24px;
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), 
                        url('https://www.crunchyroll.com/imgsrv/display/thumbnail/1200x675/catalog/crunchyroll/1ecde018e863e2aaee31f00a23378c35.jpe');
            background-size: cover;
            background-position: center;
        }
        
        .player-controls {
            background-color: rgba(0, 0, 0, 0.7);
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .control-button {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin: 0 5px;
        }
        
        .progress-bar {
            flex-grow: 1;
            height: 5px;
            background-color: rgba(255, 255, 255, 0.3);
            margin: 0 15px;
            border-radius: 3px;
            position: relative;
        }
        
        .progress {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 30%;
            background-color: var(--primary-color);
            border-radius: 3px;
        }
        
        .video-info {
            display: flex;
            padding: 20px 0;
        }
        
        .anime-poster {
            width: 200px;
            height: 300px;
            object-fit: cover;
            border-radius: 5px;
            margin-right: 20px;
        }
        
        .anime-details {
            flex-grow: 1;
        }
        
        .anime-title {
            font-size: 28px;
            margin: 0 0 10px 0;
        }
        
        .episode-title {
            font-size: 20px;
            color: var(--primary-color);
            margin: 0 0 15px 0;
        }
        
        .metadata {
            display: flex;
            margin-bottom: 15px;
        }
        
        .metadata-item {
            margin-right: 20px;
            font-size: 14px;
        }
        
        .description {
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .episode-list {
            margin-top: 30px;
        }
        
        .episode-list h3 {
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            padding-bottom: 10px;
        }
        
        .episode {
            display: flex;
            padding: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            cursor: pointer;
        }
        
        .episode:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
        
        .episode-number {
            width: 50px;
            color: var(--primary-color);
            font-weight: bold;
        }
        
        .episode-info {
            flex-grow: 1;
        }
        
        .episode-duration {
            color: rgba(255, 255, 255, 0.6);
            font-size: 14px;
        }
        
        .footer {
            background-color: #000;
            padding: 30px;
            text-align: center;
            margin-top: 50px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }
        
        .footer-links a {
            color: rgba(255, 255, 255, 0.7);
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }
        
        .copyright {
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">
            <img src="https://www.crunchyroll.com/build/assets/img/logo.png" alt="Crunchyroll Logo">
        </div>
        <nav class="nav-links">
            <a href="#">Browse</a>
            <a href="#">Manga</a>
            <a href="#">Games</a>
            <a href="#">News</a>
        </nav>
        <div class="user-menu">
            <div class="search-icon">🔍</div>
            <div class="user-icon">👤</div>
        </div>
    </header>
    
    <main class="video-container">
        <div class="video-player">
            <div class="video-placeholder">
                <div>Video Player Placeholder</div>
            </div>
            <div class="player-controls">
                <div>
                    <button class="control-button">⏮</button>
                    <button class="control-button">⏯</button>
                    <button class="control-button">⏭</button>
                </div>
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
                <div>
                    <button class="control-button">🔊</button>
                    <button class="control-button">⛶</button>
                </div>
            </div>
        </div>
        
        <div class="video-info">
            <img src="https://www.crunchyroll.com/imgsrv/display/thumbnail/240x360/catalog/crunchyroll/1ecde018e863e2aaee31f00a23378c35.jpe" 
                 alt="Attack on Titan Poster" class="anime-poster">
            <div class="anime-details">
                <h1 class="anime-title">Attack on Titan Final Season</h1>
                <h2 class="episode-title">Episode 5: From One Hand to Another</h2>
                
                <div class="metadata">
                    <div class="metadata-item">TV-14</div>
                    <div class="metadata-item">Sub | Dub</div>
                    <div class="metadata-item">24m</div>
                </div>
                
                <p class="description">
                    As the battle for the fate of Paradis Island rages on, Eren continues to move forward with his plan. 
                    Meanwhile, the alliance of Marleyan warriors and Survey Corps members makes their way to stop him, 
                    setting the stage for an epic confrontation.
                </p>
                
                <div>
                    <button style="background-color: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                        Add to Watchlist
                    </button>
                </div>
            </div>
        </div>
        
        <div class="episode-list">
            <h3>Episodes</h3>
            <div class="episode">
                <div class="episode-number">1</div>
                <div class="episode-info">
                    <div>The Other Side of the Sea</div>
                    <div class="episode-duration">24m</div>
                </div>
            </div>
            <div class="episode">
                <div class="episode-number">2</div>
                <div class="episode-info">
                    <div>Midnight Train</div>
                    <div class="episode-duration">23m</div>
                </div>
            </div>
            <div class="episode">
                <div class="episode-number">3</div>
                <div class="episode-info">
                    <div>The Door of Hope</div>
                    <div class="episode-duration">22m</div>
                </div>
            </div>
            <div class="episode">
                <div class="episode-number">4</div>
                <div class="episode-info">
                    <div>From One Hand to Another</div>
                    <div class="episode-duration">24m</div>
                </div>
            </div>
            <div class="episode">
                <div class="episode-number">5</div>
                <div class="episode-info">
                    <div>Declaration of War</div>
                    <div class="episode-duration">23m</div>
                </div>
            </div>
        </div>
    </main>
    
    <footer class="footer">
        <div class="footer-links">
            <a href="#">Help/FAQ</a>
            <a href="#">Terms of Use</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Preferences</a>
            <a href="#">Legal Info</a>
        </div>
        <div class="copyright">
            © Crunchyroll, LLC (This is a demo only)
        </div>
    </footer>
    
    <script>
        // Simple video player controls
        document.addEventListener('DOMContentLoaded', function() {
            const playButton = document.querySelector('.player-controls .control-button:nth-child(2)');
            let isPlaying = false;
            
            playButton.addEventListener('click', function() {
                isPlaying = !isPlaying;
                playButton.textContent = isPlaying ? '⏸' : '⏯';
            });
            
            // Episode selection
            const episodes = document.querySelectorAll('.episode');
            episodes.forEach(ep => {
                ep.addEventListener('click', function() {
                  const episodeNum = this.querySelector('.episode-number').textContent;
                      episodeTitle = this.querySelector('.episode-info div').textContent;
                    
                    document.querySelector('.episode-title').textContent = 
                        `Episode ${episodeNum}: ${episodeTitle}`;
                    
                    // Update active episode style
                    episodes.forEach(e => e.style.backgroundColor = 'transparent');
                    this.style.backgroundColor = 'rgba(244, 117, 33, 0.1)';
                });
            });
        });
    </script>
</body>
</html>`;
}
