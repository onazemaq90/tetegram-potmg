export default {
  async fetch(request) {
    const url = new URL(request.url);
    const bin = url.searchParams.get('bin');
    const ip = url.searchParams.get('ip');

    if (!bin && !ip) {
      return new Response(JSON.stringify({ error: "Provide either ?bin= or ?ip=" }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    const rapidApiUrl = "https://bin-ip-checker.p.rapidapi.com/";
     

    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': 'c7e2fc48e0msh077ba9d1e502feep11ddcbjsn4653c738de70',
        'x-rapidapi-host': 'bin-ip-checker.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bin: bin || '', ip: ip || '' })
    };

    try {
      const response = await fetch(rapidApiUrl, options);
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: "API request failed", details: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      });
    }
  }
};
