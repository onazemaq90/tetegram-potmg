addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Handle GET requests to /chat endpoint
  if (url.pathname === '/chat' && request.method === 'GET') {
    const question = url.searchParams.get('question');
    const modelParam = url.searchParams.get('model') || 'deepseek-r1';

    // Validate question parameter
    if (!question) {
      return new Response(JSON.stringify({ error: 'Question parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Map model parameter to full model identifier
    const model = modelParam === 'deepseek-r1' 
      ? '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b' 
      : modelParam;

    try {
      // Create messages array
      const messages = [
        {
          role: "system",
          content: "You are a friendly assistan that helps write stories"
        },
        {
          role: "user",
          content: question
        }
      ];

      // Call AI model
      const result = await run(model, { messages });
      
      // Return successful response
      return new Response(JSON.stringify(result), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Add CORS headers if needed
        }
      });
      
    } catch (error) {
      // Handle errors
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Return 404 for other endpoints
  return new Response('Not Found', { status: 404 });
}

// Existing run function (update API_TOKEN and account ID)
async function run(model, input) {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/05155e8a4c89ed88082182aed190fec7/ai/run/${model}`,
    {
      headers: { 
        Authorization: "10Ddp8ptjfl2weyfRjat5Hlo3iKTjzhr-Kgdr5bd" // Replace with your API token
      },
      method: "POST",
      body: JSON.stringify(input),
    }
  );
  return response.json();
}
