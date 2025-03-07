addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  try {
    // Get URL parameter from the query string
    const requestUrl = new URL(request.url)
    const inputUrl = requestUrl.searchParams.get('url')

    if (!inputUrl) {
      return new Response(JSON.stringify({ error: 'Missing URL parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Configure the API request
    const apiUrl = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink'
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': 'c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70',
        'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: inputUrl })
    }

    // Forward the request to RapidAPI
    const response = await fetch(apiUrl, options)
    
    // Return the response with CORS headers
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
