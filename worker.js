export default {
  async fetch(request, env) {
    // Get the question from URL parameter
    const url = new URL(request.url);
    const question = url.searchParams.get('question');

    // If no question provided, return error
    if (!question) {
      return new Response('Please provide a question parameter', { status: 400 });
    }

    // Your original run function
    async function run(model, input) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/05155e8a4c89ed88082182aed190fec7/ai/run/${model}`,
        {
          headers: { 
            Authorization: `Bearer ${env.API_TOKEN}` // Store token in environment variable
          },
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      const result = await response.json();
      return result;
    }

    try {
      // Call the AI with the question
      const aiResponse = await run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
        messages: [
          {
            role: "system",
            content: "You are a friendly assistant that helps write stories",
          },
          {
            role: "user",
            content: question,
          },
        ],
      });

      // Return the response
      return new Response(JSON.stringify(aiResponse), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  }
};
