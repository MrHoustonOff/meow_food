import { complete as groqComplete } from './groq.js';
import { complete as ollamaComplete } from './ollama.js';

export async function complete(messages, settings) {
  const { provider, aiKey, ollamaUrl, ollamaModel } = settings;

  if (provider === 'mock') {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`{
  "time": "15:00",
  "day": "Неизвестно",
  "meal_type": "Перекус",
  "foods": [
    {
      "name": "кофе с молоком",
      "amount": "500 мл",
      "macros": null
    },
    {
      "name": "творог мягкий",
      "amount": "125г",
      "macros": {
        "per_100g": {"b": 8.5, "f": 5, "c": 1.6},
        "total_weight": "125г",
        "total": {"b": 10.625, "f": 6.25, "c": 2}
      }
    }
  ],
  "facts": ["Это тестовый MOCK ответ"],
  "has_food": true
}`);
      }, 1500);
    });
  } else if (provider === 'ollama') {
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
