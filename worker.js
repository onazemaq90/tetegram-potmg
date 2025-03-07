addEventListener('fetch', event => {
    const { request } = event;
    if (request.method === 'OPTIONS') {
        // Handle CORS preflight requests
        event.respondWith(handleOptions());
    } else if (request.method === 'GET' && new URL(request.url).pathname === '/') {
        // Serve HTML frontend if accessing root
        event.respondWith(serveFrontend());
    } else if (request.method === 'GET') {
        // Handle API calls
        event.respondWith(handleRequest(event.request));
    } else {
        event.respondWith(new Response('Method not allowed', { status: 405 }));
    }
});

function handleOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

async function handleRequest(request) {
    try {
        const requestUrl = new URL(request.url);
        const inputUrl = requestUrl.searchParams.get('url');

        if (!inputUrl) {
            return new Response(JSON.stringify({ error: 'Missing URL parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const apiUrl = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';

        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-key': 'c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70',
                'x-rapidapi-host': 'social-download-all-in-one.p.rapidapi.com',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: inputUrl }),
        };

        const response = await fetch(apiUrl, options);
        const responseData = await response.json();

        return new Response(JSON.stringify(responseData), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

function serveFrontend() {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Social Media Downloader</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(0,0,0,0.1);
                text-align: center;
            }
            input {
                width: 80%;
                padding: 10px;
                margin: 10px 0;
            }
            button {
                padding: 10px 20px;
                cursor: pointer;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
            }
            #result {
                margin-top: 15px;
                word-break: break-all;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Social Media Downloader</h2>
            <input type="text" id="urlInput" placeholder="Enter social media URL..." />
            <button onclick="fetchDownloadLink()">Download</button>
            <div id="result"></div>
        </div>
        <script>
            async function fetchDownloadLink() {
                const url = document.getElementById('urlInput').value;
                if (!url) {
                    alert('Please enter a URL');
                    return;
                }
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = 'Fetching...';

                try {
                    const response = await fetch(\`/api?url=\${encodeURIComponent(url)}\`);
                    const data = await response.json();
                    if (data.result && data.result[0]) {
                        resultDiv.innerHTML = '<a href="' + data.result[0].url + '" target="_blank">Download Link</a>';
                    } else {
                        resultDiv.innerHTML = 'Failed to fetch download link.';
                    }
                } catch (error) {
                    resultDiv.innerHTML = 'Error: ' + error.message;
                }
            }
        </script>
    </body>
    </html>`;
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
    });
}
          
