addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');
  
  if (!videoUrl) {
    return new Response(JSON.stringify({
      error: 'Please provide a video URL parameter (?url=...)'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await processVideoUrl(videoUrl);
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// XHamster specific headers
function getXhamsterHeaders() {
  return {
    'Host': 'xhamster.com',
    'User-Agent': getRandomUserAgent(),
    'DNT': '1',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
    'TE': 'trailers'
  };
}

// Simple random user agent generator
function getRandomUserAgent() {
  const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

async function processVideoUrl(videoUrl) {
  const headers = getXhamsterHeaders();
  
  // Determine URL type
  let urlType = 'unknown';
  if (videoUrl.includes('xhamster.com/videos')) {
    urlType = 'video';
  } else if (videoUrl.includes('xhamster.com/my')) {
    urlType = 'playlist';
  } else {
    throw new Error('Unable to determine URL type');
  }

  // Make initial request
  const response = await fetch(videoUrl, { headers });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('403 Forbidden - Cookies might be required');
    }
    throw new Error(`Initial connection failed: Status ${response.status}`);
  }

  const html = await response.text();
  
  if (urlType === 'playlist') {
    return await processPlaylist(videoUrl, html, headers);
  } else {
    return await processSingleVideo(videoUrl, html);
  }
}

async function processPlaylist(baseUrl, html, headers) {
  const videoUrls = [];
  let page = 1;
  let currentUrl = standardizeUrl(baseUrl) + page;

  while (true) {
    const response = await fetch(currentUrl, { headers });
    if (!response.ok) {
      if (response.status === 404) {
        break; // Assume we've reached the end
      }
      throw new Error(`Playlist page ${page} failed: ${response.status}`);
    }

    const pageHtml = await response.text();
    if (pageHtml.includes('<title>Page not found</title>')) {
      break;
    }

    const extractedUrls = extractVideoUrls(pageHtml);
    if (extractedUrls.length === 0) {
      break;
    }

    videoUrls.push(...extractedUrls);
    page++;
    currentUrl = standardizeUrl(baseUrl) + page;
  }

  return {
    type: 'playlist',
    videos: videoUrls.filter(url => 
      url.includes('com/videos') && !url.includes('com/videos/recommended')
    )
  };
}

async function processSingleVideo(videoUrl, html) {
  // In a real implementation, you'd extract the actual video URL here
  // For this example, we'll just return the metadata
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'Unknown Title';

  return {
    type: 'video',
    url: videoUrl,
    title: title
  };
}

function extractVideoUrls(html) {
  // Simple URL extraction - in reality, you'd want more sophisticated parsing
  const urlPattern = /href=["'](https:\/\/xhamster\.com\/videos\/[^"']+)["']/g;
  const matches = [...html.matchAll(urlPattern)];
  return matches.map(match => match[1]);
}

function standardizeUrl(url) {
  if (!url.endsWith('/')) {
    url += '/';
  }
  return url;
}
