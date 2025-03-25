// Cloudflare Worker script
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Get URL parameters
  const urlParams = new URL(request.url);
  const targetUrl = urlParams.searchParams.get('url'); // Gets the ?url= parameter

  // Check if URL parameter exists
  if (!targetUrl) {
    return new Response('Please provide a URL parameter (?url=)', {
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // API configuration
  const apiUrl = 'https://terabox-downloader-tool.p.rapidapi.com/api';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'YOUR_API_KEY_HERE', // Replace with your actual API key
      'x-rapidapi-host': 'terabox-downloader-tool.p.rapidapi.com'
    }
  };

  try {
    // Modify the API URL to include the target URL as a parameter
    const fullUrl = `${apiUrl}?url=${encodeURIComponent(targetUrl)}`;
    
    // Make the API request
    const response = await fetch(fullUrl, options);
    const result = await response.text();
    
    // Return the response
    return new Response(result, {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Optional: for CORS
      }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
