export async function complete(messages, apiKey, model = 'llama-3.3-70b-versatile') {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages
    })
  });

  if (!response.ok) {
    const err = new Error(`Groq API Error: ${response.statusText}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
