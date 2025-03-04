// worker.js
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get("url");

  if (!videoUrl) {
    return new Response("Please provide a URL via ?url= parameter", { status: 400 });
  }

  try {
    const extractor = "xhamster";
    const headers = getXhamsterHeaders();

    // Simulate initial connection (fetch HTML)
    const response = await fetch(videoUrl, { headers });
    if (response.status === 403) {
      return new Response("403 Forbidden: Cookies may be required", { status: 403 });
    } else if (response.status !== 200) {
      return new Response(`Connection failed: Status ${response.status}`, { status: 500 });
    }

    const html = await response.text();
    const urlType = determineUrlType(videoUrl, extractor);

    // Return metadata (for demo purposes)
    return new Response(
      JSON.stringify({
        extractor,
        url: videoUrl,
        urlType,
        status: response.status,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

function getXhamsterHeaders() {
  return {
    "Host": "xhamster.com",
    "User-Agent": randomizeUserAgent(),
    "DNT": "1",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    "TE": "trailers",
  };
}

function randomizeUserAgent() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15",
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

function determineUrlType(url, extractor) {
  if (url.includes(`${extractor}.com/videos`)) return "video";
  if (url.includes(`${extractor}.com/my`)) return "playlist";
  throw new Error(`Unable to determine ${extractor} URL type for ${url}`);
}
