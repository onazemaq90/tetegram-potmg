// src/worker.js
export default {
  async fetch(request, env) {
    const APIFY_API_TOKEN = env.APIFY_API_TOKEN;
    const ACTOR_ID = '6DxvlyVtOgcLG9QVd';
    const DEFAULT_LOCATIONS = [
      "https://www.instagram.com/explore/locations/451366841879591/palace-of-versailles/",
      "1412043802427435"
    ];

    try {
      // Parse request URL for parameters
      const url = new URL(request.url);
      const urlParams = url.searchParams.getAll('url');
      
      // Use URL parameters or default locations
      const locations = urlParams.length > 0 ? urlParams : DEFAULT_LOCATIONS;

      // Construct input
      const input = {
        locations: locations
      };

      // Run Apify Actor
      const runResponse = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}&waitForFinish=30`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        }
      );

      if (!runResponse.ok) {
        throw new Error(`Apify run failed: ${await runResponse.text()}`);
      }

      const runData = await runResponse.json();

      // Get results from dataset
      const datasetResponse = await fetch(
        `https://api.apify.com/v2/datasets/${runData.data.defaultDatasetId}/items?token=${APIFY_API_TOKEN}`
      );

      if (!datasetResponse.ok) {
        throw new Error(`Dataset fetch failed: ${await datasetResponse.text()}`);
      }

      const items = await datasetResponse.json();

      return new Response(JSON.stringify(items, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
