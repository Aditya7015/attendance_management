import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaUser,
  FaSpinner,
  FaMinus,
  FaExpand,
  FaCompress,
  FaClock,
  FaInfoCircle,
  FaQuestionCircle,
  FaLightbulb,
  FaRocket,
  FaRegLightbulb,
  FaRegClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Don't render chatbot if user is not logged in
  if (!user) {
    return null;
  }

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content: `👋 Hello ${user?.fullName?.split(' ')[0] || 'there'}! I'm **AttendAI**, your attendance assistant. I can help you with:

• ⏰ Clock in/out instructions
• 📝 Request corrections
• 📊 View attendance history
• 🏢 Team attendance (HR/Admin)
• ⚙️ System features

What would you like to know?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, user, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // Add user message to chat
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await api.post('/chat', { message: userMessage });
      
      setIsTyping(false);
      
      // Add bot response to chat
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      // Show error message
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: '😅 Oops! I encountered an error. Please try again or check your internet connection.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickSuggestions = [
    { icon: <FaRegClock className="text-blue-500" />, text: 'How do I clock in?' },
    { icon: <FaRocket className="text-purple-500" />, text: 'How to request correction?' },
    { icon: <FaLightbulb className="text-yellow-500" />, text: 'What are attendance rules?' },
    { icon: <FaQuestionCircle className="text-green-500" />, text: 'How to view my history?' },
  ];

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/40 group-hover:shadow-blue-500/60 transition-all duration-300 flex items-center justify-center text-white transform group-hover:scale-105">
            {isOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <div className="relative">
                <FaRobot className="text-3xl" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
            )}
          </div>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? 'min(90vw, 1200px)' : (isMinimized ? '380px' : '420px'),
              height: isExpanded ? 'min(90vh, 800px)' : (isMinimized ? '60px' : '620px'),
              maxWidth: isExpanded ? '1200px' : '420px',
              maxHeight: isExpanded ? '800px' : '620px',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-24 right-6 z-50 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 cursor-pointer"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-50 animate-pulse"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <FaRobot className="text-white text-xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">AttendAI</h3>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block"></span>
                      Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 text-white/80 hover:text-white"
                  >
                    {isExpanded ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(!isMinimized);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 text-white/80 hover:text-white"
                  >
                    {isMinimized ? <FaExpand className="text-sm" /> : <FaMinus className="text-sm" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-all duration-300 text-white/80 hover:text-white"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${
                  isExpanded ? 'min-h-[calc(90vh-130px)]' : 'min-h-[420px]'
                } custom-scrollbar`}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-2 max-w-[85%] ${
                        msg.type === 'user' ? 'flex-row-reverse' : ''
                      }`}>
                        <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
                          msg.type === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                            : msg.isError
                            ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 shadow-gray-500/30'
                        }`}>
                          {msg.type === 'user' ? (
                            <FaUser className="text-white text-sm" />
                          ) : (
                            <FaRobot className={msg.isError ? 'text-white text-sm' : 'text-gray-700 dark:text-gray-300 text-sm'} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className={`rounded-2xl px-4 py-2.5 ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                              : msg.isError
                              ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200 shadow-lg shadow-gray-500/10 border border-white/50 dark:border-gray-600/30'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </div>
                          </div>
                          <div className={`text-[10px] mt-1 text-gray-400 dark:text-gray-500 ${
                            msg.type === 'user' ? 'text-right' : 'text-left'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-2 max-w-[85%]">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg shadow-gray-500/30">
                          <FaRobot className="text-gray-700 dark:text-gray-300 text-sm" />
                        </div>
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl px-4 py-3 shadow-lg shadow-gray-500/10 border border-white/50 dark:border-gray-600/30">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions */}
                {messages.length < 3 && (
                  <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-2">
                      {quickSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            setInput(suggestion.text);
                            if (inputRef.current) inputRef.current.focus();
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-400"
                        >
                          {suggestion.icon}
                          <span>{suggestion.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area - FIXED TEXT VISIBILITY */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:shadow-lg focus:shadow-blue-500/10"
                        style={{ 
                          color: '#1a1a1a', 
                          backgroundColor: '#ffffff',
                          fontWeight: '500'
                        }}
                        disabled={isLoading}
                      />
                      {input.length > 0 && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-medium">
                          {input.length}
                        </span>
                      )}
                    </div>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isLoading || !input.trim()}
                      className="p-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[48px]"
                    >
                      {isLoading ? (
                        <FaSpinner className="animate-spin text-lg" />
                      ) : (
                        <FaPaperPlane className="text-lg transform group-hover:rotate-12 transition-transform" />
                      )}
                    </motion.button>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      Powered by Groq AI
                    </span>
                    <span>
                      {isExpanded ? '🔄 Click minimize' : '🔍 Click expand'}
                    </span>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3B82F6, #8B5CF6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563EB, #7C3AED);
        }
        /* Force input text to be visible */
        input::placeholder {
          color: #9CA3AF !important;
          opacity: 1 !important;
        }
        .dark input::placeholder {
          color: #6B7280 !important;
          opacity: 1 !important;
        }
        /* Override any conflicting styles */
        input {
          color: #1a1a1a !important;
          -webkit-text-fill-color: #1a1a1a !important;
        }
        .dark input {
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>
    </>
  );
};

export default Chatbot;