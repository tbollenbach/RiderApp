const OpenAI = require('openai');

// Test OpenAI integration
async function testOpenAI() {
  console.log('🤖 Testing OpenAI Integration...\n');
  
  // You'll need to set your API key here for testing
  const apiKey = process.env.OPENAI_API_KEY || 'your-api-key-here';
  
  if (apiKey === 'your-api-key-here') {
    console.log('❌ Please set your OpenAI API key:');
    console.log('   Set OPENAI_API_KEY environment variable or update the script');
    console.log('   Get your API key from: https://platform.openai.com/api-keys\n');
    return;
  }

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('✅ OpenAI client initialized successfully');
    
    // Test a simple completion
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful motorcycle riding assistant. Keep responses brief and friendly.'
        },
        {
          role: 'user',
          content: 'Hello! I\'m a motorcycle rider. Can you give me one safety tip?'
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    console.log('✅ OpenAI API call successful!');
    console.log('🤖 AI Response:', response.choices[0]?.message?.content);
    console.log('\n🎉 OpenAI integration is working perfectly!');
    
  } catch (error) {
    console.error('❌ OpenAI test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   - Check your API key is correct');
    console.log('   - Ensure you have credits in your OpenAI account');
    console.log('   - Verify your internet connection');
  }
}

testOpenAI(); 