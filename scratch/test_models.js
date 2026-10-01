const fs = require('fs');

async function testModels() {
  const apiKey = fs.readFileSync('.env.local', 'utf-8').match(/GEMINI_API_KEY=(.*)/)[1].trim();
  const res = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models?key=\${apiKey}\`);
  const data = await res.json();
  const models = data.models.map(m => m.name);
  console.log("AVAILABLE MODELS:", models.join(', '));
}

testModels();
