const fs = require('fs');

async function testAllModels() {
  const apiKey = fs.readFileSync('.env.local', 'utf-8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
  const modelsToTry = ['gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash-8b'];
  
  for (const model of modelsToTry) {
    try {
      const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${apiKey}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: "Hi" }] }] })
      });
      const data = await res.json();
      console.log(model, "->", res.status, data.error?.message || "SUCCESS");
    } catch (e) {
      console.log(model, "-> FETCH EXCEPTION", e.message);
    }
  }
}

testAllModels();
