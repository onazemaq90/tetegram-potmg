export default {
  async fetch(request) {
    const url = new URL(request.url);
    const bin = url.searchParams.get("bin");
    const ip = url.searchParams.get("ip");

    if (!bin && !ip) {
      return new Response(JSON.stringify({ error: "Missing ?bin= or ?ip= parameter" }), { status: 400 });
    }

    const apiUrl = "https://bin-ip-checker.p.rapidapi.com/";
    const headers = {
      "x-rapidapi-key": "c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70",
      "x-rapidapi-host": "bin-ip-checker.p.rapidapi.com",
      "Content-Type": "application/json"
    };

    const data = bin ? { bin } : { ip };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return new Response(JSON.stringify(result), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (error) {
      return new Response(JSON.stringify({ error: "API request failed" }), { status: 500 });
    }
  }
};
