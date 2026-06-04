export async function complete(messages, url = 'http://localhost:11434', model = 'llama3.1:8b') {
  // Ensure url points to the correct endpoint
  const endpoint = url.endsWith('/api/chat') ? url : `${url.replace(/\/$/, '')}/api/chat`;
  
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
    const err = new Error(`Ollama API Error: ${response.statusText}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.message.content;
}
