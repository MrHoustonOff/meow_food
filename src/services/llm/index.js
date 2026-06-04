import { complete as groqComplete } from './groq.js';
import { complete as ollamaComplete } from './ollama.js';

export async function complete(messages, settings) {
  const { provider, aiKey, ollamaUrl, ollamaModel } = settings;

  if (provider === 'ollama') {
    return await ollamaComplete(messages, ollamaUrl, ollamaModel);
  } else if (provider === 'groq') {
    const fallbackUntil = localStorage.getItem('myau_groq_fallback_until');
    let useFallback = false;
    
    if (fallbackUntil && parseInt(fallbackUntil, 10) > Date.now()) {
      useFallback = true;
    }

    const primaryModel = import.meta.env?.VITE_GROQ_PRIMARY_MODEL || 'llama-3.3-70b-versatile';
    const fallbackModel = import.meta.env?.VITE_GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';
    
    let model = useFallback ? fallbackModel : primaryModel;

    try {
      return await groqComplete(messages, aiKey, model);
    } catch (err) {
      if (err.status === 429) {
        if (model === primaryModel) {
          // Switch to fallback and set localStorage for 2 hours
          localStorage.setItem('myau_groq_fallback_until', (Date.now() + 2 * 60 * 60 * 1000).toString());
          return await groqComplete(messages, aiKey, fallbackModel);
        } else {
          throw err;
        }
      }
      throw err;
    }
  } else {
    throw new Error(`Unknown provider: ${provider}`);
  }
}
