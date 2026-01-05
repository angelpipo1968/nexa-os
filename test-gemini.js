
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

async function testAll() {
  const googleKey = process.env.GOOGLE_API_KEY;
  const nexaKey = process.env.NEXT_PUBLIC_NEXA_API_KEY;

  console.log('--- TESTING KEYS ---');
  console.log('Google Key:', googleKey ? googleKey.substring(0, 5) + '...' : 'MISSING');
  console.log('Nexa (OpenAI) Key:', nexaKey ? nexaKey.substring(0, 5) + '...' : 'MISSING');

  // Test Gemini
  if (googleKey) {
    try {
      console.log('\nTesting Gemini...');
      const genAI = new GoogleGenerativeAI(googleKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hello");
      console.log('✅ Gemini Success:', (await result.response).text());
    } catch (e) {
      console.log('❌ Gemini Failed:', e.message);
    }
  }

  // Test OpenAI
  if (nexaKey && nexaKey.startsWith('sk-')) {
    try {
      console.log('\nTesting OpenAI...');
      const openai = new OpenAI({ apiKey: nexaKey });
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "Hello" }],
        model: "gpt-3.5-turbo",
      });
      console.log('✅ OpenAI Success:', completion.choices[0].message.content);
    } catch (e) {
      console.log('❌ OpenAI Failed:', e.message);
    }
  }
}

testAll();
