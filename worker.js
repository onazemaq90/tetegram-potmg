addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!videoUrl) {
    return new Response(
      JSON.stringify({ error: 'Please provide a video URL using ?url=' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Validate URL
    const validDomains = ['freeterabox.com', 'www.freeterabox.com', 'terafileshare.com'];
    const videoDomain = new URL(videoUrl).hostname;
    
    if (!validDomains.includes(videoDomain)) {
      return new Response(
        JSON.stringify({ error: 'Unsupported video domain' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch video information
    const videoInfo = await getVideoInfo(videoUrl);
    
    if (request.method === 'GET' && url.pathname === '/info') {
      // Return video info
      return new Response(
        JSON.stringify(videoInfo),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Download and serve video
    const videoResponse = await fetch(videoInfo.downloadUrl);
    const videoBuffer = await videoResponse.arrayBuffer();

    return new Response(videoBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${videoInfo.filename}"`,
        'Content-Length': videoBuffer.byteLength.toString()
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process video: ' + error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function getVideoInfo(videoUrl) {
  // This is a simplified implementation
  // In reality, you'd need to:
  // 1. Fetch the page
  // 2. Parse HTML/JavaScript
  // 3. Extract actual download URL
  // 4. Get video metadata
  
  // Example implementation (you'll need to adjust based on actual site structure)
  const response = await fetch(videoUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
    }
  });
  
  const html = await response.text();
  
  // Simplified video info extraction (replace with actual parsing logic)
  return {
    originalUrl: videoUrl,
    downloadUrl: extractDownloadUrl(html, videoUrl),
    filename: extractFilename(html) || 'video.mp4',
    size: extractSize(html) || 'Unknown',
    status: 'SUCCESS'
  };
}

function extractDownloadUrl(html, originalUrl) {
  // Implement actual URL extraction logic based on site structure
  // This is a placeholder - you'll need to analyze the target sites
  return originalUrl; // Replace with real extraction
}

function extractFilename(html) {
  // Implement filename extraction
  // Look for title tags or video metadata in HTML
  const match = html.match(/<title>(.*?)<\/title>/);
  return match ? match[1].replace(/[^a-zA-Z0-9]/g, '_') + '.mp4' : null;
}

function extractSize(html) {
  // Implement size extraction if available
  return null; // Replace with real extraction
}
