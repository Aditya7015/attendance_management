const dotenv = require('dotenv');
const Groq = require('groq-sdk');

dotenv.config();

const testGroq = async () => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    
    console.log('🔑 API Key present:', !!apiKey);
    console.log('🔑 API Key starts with:', apiKey?.substring(0, 10));
    
    if (!apiKey) {
      console.error('❌ No GROQ_API_KEY found in .env file!');
      console.log('📝 Please add: GROQ_API_KEY=your_actual_key_here');
      return;
    }

    const groq = new Groq({
      apiKey: apiKey,
    });

    console.log('🔄 Testing Groq API with llama-3.1-8b-instant...');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are AttendAI, a helpful assistant for an Attendance Management System. 
          Help users with attendance-related queries. Be concise and helpful.`
        },
        {
          role: "user",
          content: "Hello! Can you help me with attendance management?"
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content;
    
    console.log('✅ Success!');
    console.log('📝 Response:', response);
    console.log('📊 Usage:', completion.usage);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

testGroq();