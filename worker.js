addEventListener('fetch', event => {  
  event.respondWith(handleRequest(event.request));  
});

async function handleRequest(request) {  
  const url = new URL(request.url);  
  const videoUrl = url.searchParams.get('url');  

  if (!videoUrl) {  
    return jsonResponse({ error: 'Missing video URL parameter (?url=...)' }, 400);
  }  

  try {  
    const response = await processVideoUrl(videoUrl);  
    return jsonResponse(response, 200);
  } catch (error) {  
    return jsonResponse({ error: error.message }, 500);
  }  
}  

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {  
    status: status,  
    headers: {  
      'Content-Type': 'application/json',  
      'Access-Control-Allow-Origin': '*'  
    }  
  });  
}

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
  const urlType = determineUrlType(videoUrl);

  if (urlType === 'unknown') {
    throw new Error('Unsupported URL type');
  }

  const response = await fetch(videoUrl, { headers });  
  if (!response.ok) {  
    if (response.status === 403) {  
      throw new Error('403 Forbidden - Cookies might be required');  
    }  
    throw new Error(`Request failed: Status ${response.status}`);  
  }  

  const html = await response.text();  
  return urlType === 'playlist' ? processPlaylist(videoUrl, html, headers) : processSingleVideo(videoUrl, html);
}  

function determineUrlType(videoUrl) {
  if (videoUrl.includes('xhamster.com/videos')) return 'video';
  if (videoUrl.includes('xhamster.com/my')) return 'playlist';
  return 'unknown';
}

async function processPlaylist(baseUrl, html, headers) {  
  const videoUrls = [];  
  let page = 1;  
  let currentUrl = standardizeUrl(baseUrl) + page;  

  while (true) {  
    const response = await fetch(currentUrl, { headers });  
    if (!response.ok) {  
      if (response.status === 404) break;  
      throw new Error(`Playlist page ${page} failed: ${response.status}`);  
    }  

    const pageHtml = await response.text();  
    if (pageHtml.includes('<title>Page not found</title>')) break;  

    const extractedUrls = extractVideoUrls(pageHtml);  
    if (extractedUrls.length === 0) break;  

    videoUrls.push(...extractedUrls);  
    page++;  
    currentUrl = standardizeUrl(baseUrl) + page;  
  }  

  return {  
    type: 'playlist',  
    videos: videoUrls.filter(url => url.includes('com/videos') && !url.includes('com/videos/recommended'))  
  };  
}  

async function processSingleVideo(videoUrl, html) {  
  return {
    type: 'video',
    url: videoUrl,
    title: extractData(html, /<title>(.*?)<\/title>/),
    duration: extractData(html, /"duration":"(.*?)"/),
    views: extractData(html, /"viewsCount":(\d+)/),
    likes: extractData(html, /"votesUp":(\d+)/),
    videoFiles: extractVideoFiles(html)
  };
}  

function extractData(html, regex) {
  const match = html.match(regex);
  return match ? match[1] : null;
}

function extractVideoFiles(html) {
  const sourcesPattern = /"videoUrl":"(https:\/\/[^"]+)"/g;
  return [...html.matchAll(sourcesPattern)].map(match => match[1]);
}

function extractVideoUrls(html) {  
  const urlPattern = /href=["'](https:\/\/xhamster\.com\/videos\/[^"']+)["']/g;  
  return [...html.matchAll(urlPattern)].map(match => match[1]);  
}  

function standardizeUrl(url) {  
  return url.endsWith('/') ? url : url + '/';  
}
