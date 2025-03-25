export default {
  async fetch(request) {
    const url = new URL(request.url);
    const bin = url.searchParams.get("bin");
    const ip = url.searchParams.get("ip");

    if (!bin && !ip) {
      return new Response(JSON.stringify({ error: "Provide either ?bin= or ?ip=" }), { status: 400 });
    }

    const apiUrl = "https://bin-ip-checker.p.rapidapi.com/";
    const apiKey = "c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70"; // Replace with your API key

    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "bin-ip-checker.p.rapidapi.com",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bin ? { bin } : { ip })
    };

    try {
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      return new Response(JSON.stringify(data), { status: response.status });
    } catch (error) {
      return new Response(JSON.stringify({ error: "API request failed" }), { status: 500 });
    }
  }
};
