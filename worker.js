// Define supported models
const SUPPORTED_MODELS = [
  "gpt-4o-mini",
  "o3-mini",
  "claude-3-haiku-20240307",
  "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  "mistralai/Mistral-Small-24B-Instruct-2501"
];

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Parse URL and query parameters
  const url = new URL(request.url);
  const prompt = url.searchParams.get("prompt") || "";
  const model = url.searchParams.get("model") || "";
  const historyParam = url.searchParams.get("history") || "";

  // Validate model
  if (model && !SUPPORTED_MODELS.includes(model)) {
    return new Response(
      JSON.stringify({
        successful: "error",
        status: 400,
        response: `Invalid model. Supported models: ${SUPPORTED_MODELS.join(", ")}`,
        model: ""
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Parse history if provided
  let history = {};
  if (historyParam) {
    try {
      history = JSON.parse(historyParam);
    } catch (e) {
      return new Response(
        JSON.stringify({
          successful: "error",
          status: 400,
          response: "Invalid history JSON format",
          model: ""
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Default response structure
  const responseData = {
    Join: "https://t.me/Ashlynn_Repository",
    successful: "success",
    status: 200,
    response: prompt ? `Processed prompt: ${prompt}` : "No prompt provided",
    model: model || "default"
  };

  // Merge history into response if provided
  if (Object.keys(history).length > 0) {
    Object.assign(responseData, { history });
  }

  // Return the response
  return new Response(
    JSON.stringify(responseData, null, 2),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
