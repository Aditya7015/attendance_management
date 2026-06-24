const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/auth');

// Initialize Groq
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('❌ GROQ_API_KEY is missing! Please add it to .env file');
}

const groq = new Groq({
  apiKey: apiKey,
});

console.log('🤖 Groq AI initialized with model: llama-3.1-8b-instant');

// System prompt for Attendance Management System
const SYSTEM_PROMPT = `You are AttendAI, a helpful and professional AI assistant for an Attendance Management System.

ABOUT THE SYSTEM:
- Employees can clock in and out
- Users can request corrections for attendance records
- HR and Admins can review and approve/reject correction requests
- Admins can manage users and configure attendance rules
- Role-based access: Employee, HR, Admin

CAPABILITIES:
- Help with clock in/out procedures
- Guide on requesting attendance corrections
- Explain attendance rules and policies
- Assist with viewing attendance history
- Help HR/Admin with team management
- Explain system features and navigation

RESPONSE GUIDELINES:
- Be helpful, friendly, and professional
- Keep responses concise (2-3 sentences max)
- Use bullet points for lists
- If unsure, suggest checking the dashboard
- Stay focused on attendance management topics
- Don't ask follow-up questions unless necessary
- Keep responses under 100 words

Remember: You are a helpful assistant for the Attendance Management System.`;

// @desc    Send message to AI chatbot
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    console.log('💬 Chat request received');
    console.log('📝 Message:', message);
    console.log('👤 User:', req.user?.email);

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    if (!apiKey) {
      console.error('❌ API key missing');
      return res.status(500).json({
        success: false,
        message: 'AI service is not configured. Please check server configuration.'
      });
    }

    console.log('🔄 Calling Groq API with llama-3.1-8b-instant...');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 150,
      top_p: 1,
      stream: false,
    });

    const aiResponse = completion.choices[0]?.message?.content || 
                      'I apologize, but I could not generate a response. Please try again.';

    console.log('✅ Groq response received');
    console.log('📊 Tokens used:', completion.usage?.total_tokens || 'N/A');

    // Optional: Log to console only (skip database logging)
    console.log('💬 AI Response:', aiResponse);

    res.status(200).json({
      success: true,
      response: aiResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('❌ Chat error:', error.message);
    
    // Handle specific errors
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key. Please check your Groq API configuration.'
      });
    }

    if (error.message?.includes('quota')) {
      return res.status(429).json({
        success: false,
        message: 'API quota exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process your request. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chat history (placeholder)
// @route   GET /api/chat/history
// @access  Private
const getChatHistory = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Chat history feature coming soon'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
};

// Routes
router.post('/', auth, sendMessage);
router.get('/history', auth, getChatHistory);

module.exports = router;