addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const telegramRTMP = "rtmps://dc5-1.rtmp.t.me/s/";
    const streamKey = "2296144137:iRDVLdhbJLbV84KwU4FUtw"; // Replace with your Telegram stream key

    const url = new URL(request.url);
    const videoSource = url.searchParams.get("source"); // Expecting ?source=http://your-video-url

    if (!videoSource) {
        return new Response("Missing video source URL", { status: 400 });
    }

    const proxyUrl = `${telegramRTMP}/${streamKey}`;

    // Forward the stream
    const response = await fetch(videoSource, {
        method: "GET",
        headers: { "Content-Type": "video/mp4" },
    });

    return new Response(response.body, {
        status: 200,
        headers: { "Content-Type": "video/mp4" }
    });
}
