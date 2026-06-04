export async function complete(messages, url = 'http://localhost:11434', model = 'llama3.1:8b') {
  // Ensure url points to the OpenAI compatible endpoint
  let endpoint = url.trim().replace(/\/$/, '');
  if (endpoint.endsWith('/api/chat')) {
    endpoint = endpoint.replace('/api/chat', '/v1/chat/completions');
  } else if (!endpoint.endsWith('/v1/chat/completions')) {
    endpoint = `${endpoint}/v1/chat/completions`;
  }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false
    })
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorBody = await response.json();
      if (errorBody.error && errorBody.error.message) {
        errorDetail = errorBody.error.message;
      } else if (errorBody.error) {
        errorDetail = errorBody.error;
      }
    } catch (e) {
      // Ignore if not JSON
    }
    const err = new Error(`Ollama API Error: ${errorDetail}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
