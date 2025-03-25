// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const bin = url.searchParams.get('bin') || '448590'  // Default to 448590
  
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'bin-ip-checker.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bin: bin })
  }

  try {
    // Make the API request
    const response = await fetch('https://bin-ip-checker.p.rapidapi.com/?bin=448590', options)
    const data = await response.json()
    
    // Return response to client
    return new Response(JSON.stringify(data), {
      headers: { 'content-type': 'application/json' },
      status: 200
    })
  } catch (error) {
    // Error handling
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    })
  }
}
