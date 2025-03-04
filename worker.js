addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const page = url.searchParams.get('page') || 1
  
  // Configuration
  const baseUrl = 'http://www.xhamster.com'  // Note: This is just for example
  const searchUrlTemplate = 'http://xhamster.com/channels/new-asian-%s.html'
  
  try {
    // Fetch page content
    const response = await fetch(searchUrlTemplate.replace('%s', page))
    const html = await response.text()
    
    // Simple URL extraction (replacing PyQuery)
    const movieLinks = extractMovieLinks(html)
    
    // Process each URL and get download links
    const results = await Promise.all(
      movieLinks.map(async (link) => {
        return await getDownloadUrl(`${baseUrl}${link}`)
      })
    )
    
    // Return JSON response instead of downloading files
    return new Response(JSON.stringify({
      status: 'success',
      page: page,
      results: results.filter(r => r !== null)
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function extractMovieLinks(html) {
  const movieRegex = /href="\/movies\/[^"]+"/g
  const matches = html.match(movieRegex) || []
  return matches.map(match => match.replace('href="', '').replace('"', ''))
}

async function getDownloadUrl(url) {
  try {
    const response = await fetch(url)
    const html = await response.text()
    
    // Extract download URL using regex
    const fileMatch = html.match(/'file':\s*'([\w\d\.:/_\-\?=]*)'/)
    const srvMatch = html.match(/'srv':\s*'([\w\d.:/_]*)'/)
    
    if (srvMatch && fileMatch) {
      const fileName = fileMatch[1].split('/').pop()
      const downloadUrl = `${srvMatch[1]}/flv2/${fileName}`
      
      return {
        originalUrl: url,
        downloadUrl: downloadUrl,
        fileName: fileName
      }
    }
    return null
  } catch (error) {
    console.error(`Error processing ${url}: ${error}`)
    return null
  }
}
