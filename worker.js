// index.js for your Cloudflare Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle form submission
    if (url.pathname === '/login' && request.method === 'POST') {
      return handleLogin(request);
    }
    
    // Serve the login page
    return new Response(loginPageHTML(), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};

function handleLogin(request) {
  // In a real implementation, you would process the form data here
  // For this demo, we'll just redirect to a "success" page
  
  return new Response(`
    <html>
      <head>
        <title>Login Successful</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: green; font-size: 24px; }
        </style>
      </head>
      <body>
        <div class="success">Login successful (demo)</div>
        <p>This is a demo page. In a real implementation, you would be redirected to your account.</p>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

function loginPageHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crunchyroll - Login</title>
    <style>
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
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo img {
            height: 40px;
        }
        h1 {
            font-size: 24px;
            text-align: center;
            margin-bottom: 30px;
            color: #f47521;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
        }
        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            box-sizing: border-box;
        }
        .checkbox {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .checkbox input {
            margin-right: 10px;
        }
        button {
            width: 100%;
            padding: 14px;
            background-color: #f47521;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
        }
        button:hover {
            background-color: #e06c1d;
        }
        .links {
            margin-top: 20px;
            text-align: center;
        }
        .links a {
            color: #f47521;
            text-decoration: none;
            margin: 0 10px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #777;
        }
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
</html>
  `;
}
