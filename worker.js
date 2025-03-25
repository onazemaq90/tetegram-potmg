// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Define API options
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': 'c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70',
      'x-rapidapi-host': 'bin-ip-checker.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ bin: '448590' })
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
