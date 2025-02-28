// Cloudflare Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const question = url.searchParams.get('question');

    if (!question) {
      return new Response('Please provide a question parameter', { status: 400 });
    }

    // Your AI API call function
    async function run(model, input) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/05155e8a4c89ed88082182aed190fec7/ai/run/${model}`,
        {
          headers: { 
            Authorization: `Bearer ${env.API_TOKEN}`
          },
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      return await response.json();
    }

    try {
      const aiResponse = await run("@cf/deepseek-ai/deepseek-r1-distill-qwen-32b", {
        messages: [
          {
            role: "system",
            content: "You are a friendly assistant",
          },
          {
            role: "user",
            content: question,
          },
        ],
      });

      return new Response(JSON.stringify({
        success: true,
        response: aiResponse.result?.response || "No response from AI"
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.message 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      });
    }
  }
};
