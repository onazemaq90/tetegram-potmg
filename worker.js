// Chat API handler for Cloudflare Pages
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Supported models
const SUPPORTED_MODELS = new Set([
  'gpt-4o-mini',
  'o3-mini',
  'claude-3-haiku-20240307',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'mistralai/Mistral-Small-24B-Instruct-2501'
])

// Default model
const DEFAULT_MODEL = 'gpt-4o-mini'

async function handleRequest(request) {
  // Enable CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const url = new URL(request.url)
    const prompt = url.searchParams.get('prompt')
    const model = url.searchParams.get('model') || DEFAULT_MODEL
    const historyParam = url.searchParams.get('history')
    
    // Validate required prompt parameter
    if (!prompt) {
      throw new Error('Missing required parameter: prompt')
    }

    // Validate model parameter
    if (!SUPPORTED_MODELS.has(model)) {
      throw new Error('Invalid model specified')
    }

    // Parse history if provided
    let history = []
    if (historyParam) {
      try {
        history = JSON.parse(historyParam)
        if (!Array.isArray(history)) {
          throw new Error('History must be an array')
        }
      } catch {
        throw new Error('Invalid history format')
      }
    }

    // Process the chat request
    // Note: This is a mock response. In a real implementation,
    // you would integrate with your actual AI model service here
    const response = {
      "Join": "https://t.me/Ashlynn_Repository",
      "successful": "success",
      "status": 200,
      "response": await processChat(prompt, model, history),
      "model": model
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      successful: "error",
      status: 400,
      error: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    })
  }
}

async function processChat(prompt, model, history) {
  // Mock implementation - replace with actual AI model integration
  // This is where you would integrate with your AI service
  
  // For demonstration purposes, we're returning a simple response
  // In a real implementation, you would:
  // 1. Call your AI service API
  // 2. Process the response
  // 3. Handle rate limiting, errors, etc.
  
  return `Response to: ${prompt}`
}
