addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Extract URL from the request (e.g., via query parameter: ?url=<pinterest-url>)
  const urlObj = new URL(request.url);
  const pinterestUrl = urlObj.searchParams.get('url');

  if (!pinterestUrl) {
    return new Response(
      JSON.stringify({ error: 'Please provide a Pinterest URL via ?url=' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Define headers with the specified User-Agent
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    };

    // Fetch the Pinterest page
    const response = await fetch(pinterestUrl, { headers });
    const html = await response.text();

    // Basic parsing to extract video or image (this is simplified; real-world Pinterest scraping may require more sophistication)
    let mediaData = { video: '', image: '' };
    if (html.includes('video/mp4')) {
      // Extract video URL (simplified regex, adjust as needed)
      const videoMatch = html.match(/https:\/\/[^"]+\.mp4/);
      if (videoMatch) mediaData.video = videoMatch[0];
    } else {
      // Extract image URL (simplified regex, adjust as needed)
      const imageMatch = html.match(/https:\/\/i\.pinimg\.com\/[^"]+\.(jpg|png|jpeg)/);
      if (imageMatch) mediaData.image = imageMatch[0];
    }

    // Construct the JSON response
    const jsonResponse = {
      platform: 'Pinterest',
      status: mediaData.video || mediaData.image ? 'success' : 'not found',
      size: 'unknown', // Size would require fetching the media and checking Content-Length
      data: {
        video: mediaData.video,
        image: mediaData.image,
      },
      url: pinterestUrl,
    };

    // Return the JSON response
    return new Response(JSON.stringify(jsonResponse, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process request', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
