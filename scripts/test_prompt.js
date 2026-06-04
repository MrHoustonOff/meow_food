import { buildPrompt, extractAndValidateJSON } from '../src/utils/prompt.js';

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const MODEL = 'llama3.1:8b';

const testCases = [
  "съел борщ",
  "не спал всю ночь",
  "завтрак: 2 яйца БЖУ 12/10/1 на 100г вес 100г",
  "просто попил воды",
  "пообедал в 14:00, макароны с сыром 200г, котлета куриная 1 шт",
  "очень устал, съел сникерс по пути домой в 18:30",
  "ничего не ел, выпил кофе с молоком"
];

async function runTests() {
  console.log(`Starting prompt tests against ${MODEL} at ${OLLAMA_URL}\n`);
  
  for (const [index, userInput] of testCases.entries()) {
    console.log(`--- Test Case ${index + 1} ---`);
    console.log(`Input: "${userInput}"`);
    
    // Use fixed dates/times for consistent testing if needed,
    // or real time. We'll use current real time.
    const now = new Date();
    // Format timestamp as roughly what a user might expect, e.g., "YYYY-MM-DD HH:mm:ss" or ISO.
    // We'll use ISO string here.
    const timestamp = now.toISOString();
    
    const messages = buildPrompt(userInput, timestamp);
    
    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`Ollama HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const rawOutput = data.message.content;
      
      try {
        const parsedJSON = extractAndValidateJSON(rawOutput);
        console.log('✅ Success! Parsed JSON:');
        console.log(JSON.stringify(parsedJSON, null, 2));
      } catch (err) {
        console.error('❌ Validation/Parsing Error:', err.message);
        console.log('Raw output was:\n', rawOutput);
      }
      
    } catch (err) {
      console.error('❌ Request Error:', err.message);
      if (err.cause) console.error(err.cause);
    }
    console.log('\n');
  }
}

runTests();
