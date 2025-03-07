addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Get URL parameter from the request
  const urlObj = new URL(request.url);
  const instagramUrl = urlObj.searchParams.get('url') || 'https://www.instagram.com/p/CxLWFNksXOE/?igsh=MWc3b3ZkbHoxa2YyOQ==';
  
  // Encode the Instagram URL and construct the API endpoint
  const encodedUrl = encodeURIComponent(instagramUrl);
  const apiUrl = `https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert?url=${encodedUrl}`;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': 'c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70',
      'x-rapidapi-host': 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com'
    }
  };

  try {
    // Make the API request
    const response = await fetch(apiUrl, options);
    
    // Check if response is successful
    if (!response.ok) {
      return new Response(`API Error: ${response.status} - ${response.statusText}`, {
        status: response.status
      });
    }
    
    // Get the response text
    const result = await response.text();
    
    // Return the response
    return new Response(result, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // CORS support
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    // Error handling
    return new Response(`Error: ${error.message}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
