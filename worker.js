export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Route requests
    if (path === '/') return handleHome(request);
    if (path === '/login') return handleLogin(request);
    if (path === '/recharge') return handleRecharge(request);
    if (path === '/submit') return handleSubmit(request);
    
    return new Response('Not found', { status: 404 });
  }
};

async function handleHome(request) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Jio Recharge</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; box-sizing: border-box; }
        button { background-color: #0088cc; color: white; padding: 10px 15px; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Welcome to Jio Recharge</h1>
      <p><a href="/login">Login to recharge</a></p>
    </body>
    </html>
  `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handleLogin(request) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Jio Login</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; box-sizing: border-box; }
        button { background-color: #0088cc; color: white; padding: 10px 15px; border: none; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>Jio Login</h1>
      <form action="/recharge" method="post">
        <div class="form-group">
          <label for="mobile">Mobile Number (India +91):</label>
          <input type="tel" id="mobile" name="mobile" pattern="[0-9]{10}" placeholder="Enter 10 digit mobile number" required>
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" name="password" required>
        </div>
        <button type="submit">Login</button>
      </form>
    </body>
    </html>
  `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handleRecharge(request) {
  // In a real app, you would verify credentials here
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Jio Recharge</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        select, input { width: 100%; padding: 8px; box-sizing: border-box; }
        button { background-color: #0088cc; color: white; padding: 10px 15px; border: none; cursor: pointer; }
        .plans { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 20px 0; }
        .plan { border: 1px solid #ddd; padding: 15px; border-radius: 5px; cursor: pointer; }
        .plan.selected { border-color: #0088cc; background-color: #f0f8ff; }
      </style>
    </head>
    <body>
      <h1>Jio Recharge</h1>
      <form action="/submit" method="post">
        <div class="form-group">
          <label for="jioNumber">Jio Number:</label>
          <input type="tel" id="jioNumber" name="jioNumber" pattern="[0-9]{10}" placeholder="Enter 10 digit Jio number" required>
        </div>
        
        <h3>Select a Plan:</h3>
        <div class="plans">
          <div class="plan" onclick="selectPlan(this, '299')">
            <h4>₹299 Plan</h4>
            <p>Unlimited data - 42GB(1.5GB/Day 4G/5G Data)</p>
            <p>Unlimited Voice, 100 SMS/Day</p>
            <p>Validity: 28 Days</p>
          </div>
          
          <div class="plan" onclick="selectPlan(this, '399')">
            <h4>₹399 Plan</h4>
            <p>Unlimited data - 56GB(2GB/Day 4G/5G Data)</p>
            <p>Unlimited Voice, 100 SMS/Day</p>
            <p>Validity: 28 Days</p>
          </div>
          
          <div class="plan" onclick="selectPlan(this, '499')">
            <h4>₹499 Plan</h4>
            <p>Unlimited data - 84GB(3GB/Day 4G/5G Data)</p>
            <p>Unlimited Voice, 100 SMS/Day</p>
            <p>Validity: 28 Days</p>
          </div>
        </div>
        
        <input type="hidden" id="selectedPlan" name="selectedPlan" value="">
        
        <button type="submit">Proceed to Payment</button>
      </form>
      
      <script>
        function selectPlan(element, planValue) {
          document.querySelectorAll('.plan').forEach(p => p.classList.remove('selected'));
          element.classList.add('selected');
          document.getElementById('selectedPlan').value = planValue;
        }
      </script>
    </body>
    </html>
  `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

async function handleSubmit(request) {
  // In a real app, you would process payment here
  
  // Generate a random transaction ID
  const transactionId = 'JIO' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recharge Successful</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .success-box { border: 1px solid #4CAF50; background-color: #f8fff8; padding: 20px; border-radius: 5px; }
        .info { margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="success-box">
        <h1>Recharge Successful!</h1>
        
        <div class="info">
          <strong>Plan Name:</strong> ₹299.0
        </div>
        
        <div class="info">
          <strong>Jio Number:</strong> ${new URLSearchParams(await request.text()).get('jioNumber')}
        </div>
        
        <div class="info">
          <strong>Entitlement/Eligibility:</strong>
        </div>
        
        <div class="info">
          <strong>Benefits:</strong> Unlimited data - 42GB(1.5GB/Day 4G/5G Data), Unlimited Voice, 100 SMS/Day & Subscription to Jio Apps. Validity - 28 Days
        </div>
        
        <div class="info">
          <strong>Transaction ID:</strong> ${transactionId}
        </div>
        
        <div class="info">
          <a href="https://www.jio.com/dl/my_plans" target="_blank">View Plan Information</a>
        </div>
        
        <div class="info">
          <a href="https://www.jio.com/dl/statement" target="_blank">Check usage details</a>
        </div>
        
        <div class="info">
          <a href="https://www.jio.com/selfcare/survey/?uid=&lang=gu&source=JIO.COM&custid=" target="_blank">Share your recharge experience</a>
        </div>
      </div>
    </body>
    </html>
  `;
  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}
