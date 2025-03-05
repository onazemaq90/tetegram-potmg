export default {
  async fetch(request) {
    try {
      const url = new URL(request.url);
      const { searchParams } = url;
      
      // Get parameters from URL
      const prompt = searchParams.get('prompt');
      const model = searchParams.get('model');
      const history = searchParams.get('history');

      // List of allowed models
      const allowedModels = new Set([
        'gpt-4o-mini',
        'o3-mini',
        'claude-3-haiku-20240307',
        'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        'mistralai/Mistral-Small-24B-Instruct-2501'
      ]);

      // Validate model parameter
      if (!model || !allowedModels.has(model)) {
        throw new Error('Invalid model specified');
      }

      // Construct response object
      const responseData = {
        Join: "https://t.me/Ashlynn_Repository",
        successful: "success",
        status: 200,
        response: " ", // Add your AI response logic here
        model: model
      };

      return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });

    } catch (error) {
      // Error handling
      return new Response(JSON.stringify({
        Join: "https://t.me/Ashlynn_Repository",
        successful: "error",
        status: 400,
        response: error.message,
        model: ""
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
  }
};
