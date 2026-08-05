import React, { useState } from 'react';
import { Bot, Send, X, User, Sparkles, HelpCircle } from 'lucide-react';

export const AIChatbotDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Marhaba! I am the SIR AI Career & Visa Assistant. How can I help you regarding Dubai work visas, salary packages, or headhunter placements?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Thank you for reaching out. A SIR Recruitment consultant can also be reached on WhatsApp at +971 50 987 6543!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 bg-navy-900 text-gold-400 p-3.5 rounded-full shadow-luxury border-2 border-gold-500 hover:scale-110 transition duration-300 flex items-center space-x-2 group"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-gold-500" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1 group-hover:text-white">AI Career Assistant</span>
        </button>
      )}

      {/* Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-80 sm:w-96 glass-card bg-white dark:bg-navy-900 border border-gold-500/40 rounded-2xl shadow-luxury flex flex-col h-[480px] overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-navy-950 text-white p-3.5 flex justify-between items-center border-b border-gold-500/30">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-1">
                  SIR AI Advisor <Sparkles className="w-3 h-3 text-gold-400" />
                </h4>
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> Online • 24/7 Dubai Support
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Window */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-navy-800 text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div 
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-navy-900 text-white rounded-br-none border border-navy-700'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-navy-700'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-navy-800 text-gold-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-navy-800 text-slate-400 rounded-2xl text-[11px]">
                  Analyzing query...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 flex gap-1.5 overflow-x-auto text-[10px]">
            <button 
              onClick={() => { setInput('What are UAE work visa requirements?'); }}
              className="bg-navy-800/20 text-navy-900 dark:text-gold-400 hover:bg-gold-500 hover:text-navy-950 px-2 py-1 rounded whitespace-nowrap transition"
            >
              🇦🇪 UAE Visa Rules
            </button>
            <button 
              onClick={() => { setInput('How much are typical Dubai salaries?'); }}
              className="bg-navy-800/20 text-navy-900 dark:text-gold-400 hover:bg-gold-500 hover:text-navy-950 px-2 py-1 rounded whitespace-nowrap transition"
            >
              💰 Salary Guides
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-navy-900 border-t border-slate-200 dark:border-navy-800 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about jobs, visas, or verification..."
              className="flex-1 bg-slate-100 dark:bg-navy-950 text-navy-900 dark:text-white border border-slate-300 dark:border-navy-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-500"
            />
            <button 
              type="submit"
              className="p-2 bg-gold-shimmer text-navy-950 font-bold rounded-xl hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
