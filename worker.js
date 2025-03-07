import { ApifyClient } from 'apify-client';

// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: 'apify_api_644aKUNk8Uj3eHkbZ5tjKS9nTGevCI2LepST',
});

// Prepare Actor input
const input = {
    "locations": [
        "https://www.instagram.com/explore/locations/451366841879591/palace-of-versailles/",
        "1412043802427435"
    ]
};

(async () => {
    // Run the Actor and wait for it to finish
    const run = await client.actor("6DxvlyVtOgcLG9QVd").call(input);

    // Fetch and print Actor results from the run's dataset (if any)
    console.log('Results from dataset');
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    items.forEach((item) => {
        console.dir(item);
    });
})();
