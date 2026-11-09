import React, { useState, useEffect, useRef } from 'react';
import {
  Bot, Send, X, User, Sparkles, Phone, Calendar, Copy, Check,
  RotateCcw, Minimize2, Maximize2, Globe, Briefcase, GraduationCap,
  FileText, MessageSquare, ExternalLink, AlertCircle, Clock, ChevronDown
} from 'lucide-react';

const INITIAL_WELCOME = {
  id: 'welcome-init',
  sender: 'bot',
  text: `Welcome to **The Revival International**. I am your **Revival AI Advisor** — available 24/7 to guide you across our global educational, corporate recruitment, and career mobility services.\n\nI can assist you with:\n- 🎓 **International Admissions & UCAS Guidance** (UK, USA, Canada, Australia, Europe)\n- 💼 **Dubai & GCC Career Opportunities** across Healthcare, IT, Construction & Engineering\n- 🇦🇪 **GCC Work Visa Documentation & MOHRE Compliance**\n- 🤝 **Executive Search & Corporate Staffing**\n- 📝 **Certified Language Test Prep** (IELTS, OET, DET, TOEFL)\n\nSelect a quick action below or ask any question to get started:`,
  timestamp: 'Just now',
  suggestedQuestions: [
    '🎓 International Admissions',
    '💼 Dubai Jobs',
    '🇦🇪 UAE Visa Assistance',
    '🤝 Recruitment Services',
    '📝 IELTS Preparation',
    '📅 Book a Consultation'
  ],
  detectedService: null
};

// Markdown-like parser for clean, professional executive typography
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-xs sm:text-[13px]">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Heading 3 (###)
        if (trimmed.startsWith('### ')) {
          return (
            <h5 key={idx} className="font-serif font-bold text-sm text-[#0B1B33] dark:text-gold-400 mt-2 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{trimmed.replace(/^###\s+/, '')}</span>
            </h5>
          );
        }

        // Blockquote (>)
        if (trimmed.startsWith('> ')) {
          return (
            <div key={idx} className="border-l-2 border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-r my-1 text-[11px] italic">
              {trimmed.replace(/^>\s+/, '')}
            </div>
          );
        }

        // Bullet list item (- or •)
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const itemText = trimmed.replace(/^[-•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>{renderInlineFormatting(itemText)}</span>
            </div>
          );
        }

        // Numbered list item (1. 2. etc.)
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className="font-bold text-amber-600 dark:text-gold-400 shrink-0 text-[11px]">{numberedMatch[1]}.</span>
              <span>{renderInlineFormatting(numberedMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="my-0.5">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

// Helper for bold and italic text
const renderInlineFormatting = (str) => {
  if (!str) return '';
  // Split on bold **
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-[#0B1B33] dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

export const AIChatbotDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const isSubmittingRef = useRef(false);

  const [messages, setMessages] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clean up legacy keys
        sessionStorage.removeItem('revival_ai_advisor_session_v2');
        sessionStorage.removeItem('revival_ai_advisor_session_v3');

        const saved = sessionStorage.getItem('revival_ai_advisor_session_v4');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Strictly guarantee only 1 welcome greeting ever
            const deduped = [];
            let hasWelcome = false;
            for (const m of parsed) {
              if (m.id === 'welcome-init' || (m.sender === 'bot' && m.text.includes('Welcome to **The Revival International**.'))) {
                if (!hasWelcome) {
                  deduped.push(m);
                  hasWelcome = true;
                }
              } else {
                deduped.push(m);
              }
            }
            if (deduped.length > 0) return deduped;
          }
        }
      } catch (e) {
        console.error('Session load error', e);
      }
    }
    return [INITIAL_WELCOME];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeContext, setActiveContext] = useState({ serviceId: null, destination: null });

  // Consultation Booking Modal Inside Chat
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    countryCode: '+971',
    phone: '',
    countryInterest: 'United Kingdom',
    serviceTitle: 'International Admissions',
    serviceId: 'intl-adm',
    preferredContactMethod: 'WhatsApp',
    requirements: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [isFloatingCompact, setIsFloatingCompact] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen, isMinimized, showBookingForm]);

  // Save conversation state into sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        sessionStorage.setItem('revival_ai_advisor_session_v4', JSON.stringify(messages));
      } catch (e) {
        // quota exceeded fallback
      }
    }
  }, [messages]);

  // Focus input on drawer open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (queryText = null) => {
    if (isSubmittingRef.current) return;

    const textToSend = typeof queryText === 'string' ? queryText : input;
    if (!textToSend || !textToSend.trim() || loading) return;

    isSubmittingRef.current = true;
    const userText = textToSend.trim();
    setInput('');

    // Check if user clicked or typed consultation booking
    const lower = userText.toLowerCase();
    if (lower.includes('book a consultation') || lower.includes('open consultation booking form') || lower === '📅 book a consultation') {
      setShowBookingForm(true);
      setMessages(prev => [
        ...prev,
        {
          id: 'user-' + Date.now(),
          sender: 'user',
          text: userText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'bot-book-' + Date.now(),
          sender: 'bot',
          text: `I have opened the **Official Consultation Booking Form** for you right below. Please provide your contact details so our Senior Advisory Team can prepare your personalized assessment and reach out promptly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: [
            'Connect on WhatsApp (+91 9003475405)',
            'What documents will I need for my consultation?'
          ]
        }
      ]);
      isSubmittingRef.current = false;
      return;
    }

    const newMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, newMsg];
    setMessages(updatedHistory);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: updatedHistory,
          context: activeContext
        })
      });

      const data = await res.json();

      if (data && data.success) {
        const botMsg = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: data.suggestedQuestions || [],
          offerConsultation: Boolean(data.offerConsultation),
          detectedService: data.detectedService || null
        };

        if (data.detectedService?.id) {
          setActiveContext(prev => ({ ...prev, serviceId: data.detectedService.id }));
          setBookingData(prev => ({
            ...prev,
            serviceId: data.detectedService.id,
            serviceTitle: data.detectedService.title
          }));
        }

        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(data.message || 'API request unsuccessful');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          sender: 'bot',
          isError: true,
          failedText: userText,
          text: `We are currently experiencing a brief connection delay with our AI advisory engine. You can retry your request, or connect directly with our Senior Consultants on verified WhatsApp at **+91 9003475405**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedQuestions: [
            'Connect on WhatsApp (+91 9003475405)',
            'Book an Advisory Consultation',
            'What services does Revival International offer?'
          ]
        }
      ]);
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  const handleRetry = (failedQuery) => {
    if (failedQuery) {
      handleSendMessage(failedQuery);
    }
  };

  const handleCopy = (id, text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleResetChat = () => {
    if (window.confirm('Reset conversation history and start a new advisory session?')) {
      sessionStorage.removeItem('revival_ai_advisor_session_v4');
      setMessages([INITIAL_WELCOME]);
      setActiveContext({ serviceId: null, destination: null });
      setShowBookingForm(false);
      setBookingSuccess(null);
    }
  };

  // Submit Consultation Enquiry from within Chat
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.name.trim() || !bookingData.email.trim() || !bookingData.phone.trim()) {
      alert('Please fill in your name, email, and phone number.');
      return;
    }
    const digitsOnly = bookingData.phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      alert('Phone number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }

    setBookingLoading(true);
    try {
      const fullPhone = `${bookingData.countryCode} ${bookingData.phone.trim()}`;
      const conversationSummary = messages
        .filter(m => m.sender === 'user')
        .map(m => m.text)
        .slice(-4)
        .join('; ');

      const res = await fetch('/api/ai/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bookingData.name.trim(),
          email: bookingData.email.trim(),
          phone: fullPhone,
          serviceId: bookingData.serviceId,
          serviceTitle: bookingData.serviceTitle,
          countryInterest: bookingData.countryInterest,
          preferredContactMethod: bookingData.preferredContactMethod,
          requirements: bookingData.requirements.trim(),
          conversationSummary
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data);
        setShowBookingForm(false);

        // Add confirmed message in chat
        setMessages(prev => [
          ...prev,
          {
            id: 'bot-lead-conf-' + Date.now(),
            sender: 'bot',
            text: `### Consultation Confirmed! Reference: **#${data.referenceNumber}**\n\nThank you, **${bookingData.name.trim()}**. Your consultation inquiry for **${bookingData.serviceTitle}** has been securely registered in our advisor queue.\n\n- **Reference Number:** \`#${data.referenceNumber}\`\n- **Target Destination:** ${bookingData.countryInterest}\n- **Preferred Channel:** ${bookingData.preferredContactMethod}\n\nA Senior Advisor from our desk will review your details and contact you shortly. You can also fast-track your inquiry directly on WhatsApp using your reference code.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            whatsappLink: data.whatsappLink,
            suggestedQuestions: [
              'What documents should I prepare?',
              'How long does the assessment take?',
              'Explore University Courses'
            ]
          }
        ]);
      } else {
        alert(data.message || 'Failed to submit consultation. Please try again.');
      }
    } catch (err) {
      console.error('Lead error:', err);
      alert('Network error submitting consultation. You can reach our team directly at +91 9003475405.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Left) */}
      {!isOpen && (
        <div className="fixed bottom-4 sm:bottom-5 left-4 sm:left-6 z-40 flex items-center group">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Open Revival AI Advisor"
            className="bg-white/95 dark:bg-[#0B1B33]/95 backdrop-blur-md text-[#0B1B33] dark:text-white p-3 sm:p-3.5 rounded-full shadow-2xl border-2 border-[#C6A45C] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C6A45C]"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-white border border-[#C6A45C] flex items-center justify-center shadow-sm p-0.5 overflow-hidden">
                <img src="/images/logo.png" alt="Revival" className="w-full h-full object-contain" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-navy-900 animate-pulse" />
            </div>
            {!isFloatingCompact && (
              <div className="hidden sm:flex flex-col text-left pr-1">
                <span className="font-serif font-bold text-xs text-[#0B1B33] dark:text-white group-hover:text-amber-700 dark:group-hover:text-gold-400 transition-colors">
                  Revival AI Advisor
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  24/7 Online Support
                </span>
              </div>
            )}
          </button>

          {/* Discreet minimize toggle to ensure underlying wording is never obstructed */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFloatingCompact(!isFloatingCompact);
            }}
            title={isFloatingCompact ? "Expand AI Advisor box" : "Minimize to circle icon to view text underneath"}
            className="hidden sm:flex ml-1 w-5 h-5 rounded-full bg-slate-200/80 dark:bg-navy-800/80 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-600 dark:text-slate-300 items-center justify-center text-[10px] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {isFloatingCompact ? '+' : '–'}
          </button>
        </div>
      )}

      {/* Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white dark:bg-[#0B1B33] border border-slate-200 dark:border-[#C6A45C]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out font-sans ${isMinimized
              ? 'bottom-4 sm:bottom-5 left-4 sm:left-6 w-80 h-14'
              : 'bottom-4 sm:bottom-5 left-4 right-4 sm:right-auto sm:left-6 w-auto sm:w-[420px] h-[580px] max-h-[80vh]'
            }`}
          style={{ boxShadow: '0 20px 40px -15px rgba(11, 27, 51, 0.25)' }}
        >
          {/* Executive Header */}
          <div className="bg-gradient-to-r from-[#0B1B33] via-[#102444] to-[#0B1B33] text-white p-3.5 flex justify-between items-center border-b border-[#C6A45C]/30 select-none">
            <div className="flex items-center space-x-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#C6A45C]/60 flex items-center justify-center p-0.5 shadow-inner overflow-hidden">
                  <img src="/images/logo.png" alt="The Revival International" className="w-full h-full object-contain" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B1B33]"></span>
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
                  Revival AI Advisor
                  <span className="bg-[#C6A45C]/25 text-[#E6C687] text-[9px] px-1.5 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
                    Official
                  </span>
                </h4>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  Online • 24/7 AI Assistance
                </p>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition"
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Advisor"
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-rose-400 transition"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Scroll Area */}
              <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 dark:bg-[#071324] scroll-smooth">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-full bg-white border border-[#C6A45C]/50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm p-0.5 overflow-hidden">
                        <img src="/images/logo.png" alt="RI" className="w-full h-full object-contain" />
                      </div>
                    )}

                    <div className="max-w-[85%] sm:max-w-[80%] flex flex-col space-y-1">
                      <div
                        className={`p-3.5 rounded-2xl shadow-sm ${m.sender === 'user'
                            ? 'bg-[#0B1B33] text-white rounded-br-none'
                            : m.isError
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800 rounded-bl-none'
                              : 'bg-white dark:bg-[#0E1E38] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-navy-700/80 rounded-bl-none'
                          }`}
                      >
                        <FormattedMessage text={m.text} />

                        {/* Error Retry CTA */}
                        {m.isError && m.failedText && (
                          <div className="mt-2.5 pt-2 border-t border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
                            <span className="text-[11px] text-rose-600 dark:text-rose-300">Connection error</span>
                            <button
                              onClick={() => handleRetry(m.failedText)}
                              className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 px-2.5 py-1 rounded-md transition flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Retry Query
                            </button>
                          </div>
                        )}

                        {/* WhatsApp Action Link (if confirmed lead or recommended) */}
                        {m.whatsappLink && (
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                            <a
                              href={m.whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition shadow-sm"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Connect on WhatsApp with Reference</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Message Footer: Timestamp & Tools */}
                      <div className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span>{m.timestamp}</span>
                        {m.sender === 'bot' && !m.isError && (
                          <button
                            onClick={() => handleCopy(m.id, m.text)}
                            title="Copy response"
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                          >
                            {copiedId === m.id ? (
                              <span className="text-emerald-500 font-semibold flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Copied
                              </span>
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Contextual Action Buttons attached to Bot Message */}
                      {m.sender === 'bot' && m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1 pt-1">
                          {m.suggestedQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSendMessage(q)}
                              disabled={loading}
                              className="text-[11px] bg-white dark:bg-navy-900 text-[#0B1B33] dark:text-slate-200 hover:bg-[#C6A45C] hover:text-white dark:hover:bg-[#C6A45C] dark:hover:text-[#0B1B33] border border-slate-200 dark:border-navy-700 px-2.5 py-1 rounded-full transition-colors text-left shadow-2xs font-medium"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex gap-2.5 justify-start animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#C6A45C]/50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm p-0.5 overflow-hidden">
                      <img src="/images/logo.png" alt="RI" className="w-full h-full object-contain animate-pulse" />
                    </div>
                    <div className="p-3 bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-navy-700 text-slate-500 dark:text-slate-400 rounded-2xl rounded-bl-none shadow-sm flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-[#C6A45C] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#C6A45C] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1.5 h-1.5 bg-[#C6A45C] rounded-full animate-bounce"></span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Revival AI Advisor is reviewing...</span>
                    </div>
                  </div>
                )}

                {/* Integrated Consultation Booking Card (If opened) */}
                {showBookingForm && (
                  <div className="bg-white dark:bg-[#0E1E38] border-2 border-[#C6A45C] rounded-2xl p-3.5 shadow-md my-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-100 dark:border-navy-800">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#C6A45C]" />
                        <h6 className="font-serif font-bold text-xs text-[#0B1B33] dark:text-white">
                          Schedule Free Advisory Consultation
                        </h6>
                      </div>
                      <button
                        onClick={() => setShowBookingForm(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={bookingData.name}
                          onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                          placeholder="e.g. Sarah Khan"
                          className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C6A45C]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={bookingData.email}
                            onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                            placeholder="name@example.com"
                            className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C6A45C]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Phone / WhatsApp *
                          </label>
                          <div className="flex gap-1">
                            <select
                              value={bookingData.countryCode}
                              onChange={(e) => setBookingData({ ...bookingData, countryCode: e.target.value })}
                              className="bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-1.5 py-1.5 text-[11px] text-slate-900 dark:text-white focus:outline-none"
                            >
                              <option value="+971">🇦🇪 +971</option>
                              <option value="+91">🇮🇳 +91</option>
                              <option value="+44">🇬🇧 +44</option>
                              <option value="+1">🇺🇸 +1</option>
                              <option value="+966">🇸🇦 +966</option>
                              <option value="+974">🇶🇦 +974</option>
                            </select>
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={10}
                              required
                              value={bookingData.phone}
                              onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                              placeholder="9876543210"
                              className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C6A45C] font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Target Country / Destination
                          </label>
                          <select
                            value={bookingData.countryInterest}
                            onChange={(e) => setBookingData({ ...bookingData, countryInterest: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                          >
                            <option value="United Kingdom">United Kingdom (UK)</option>
                            <option value="Canada">Canada</option>
                            <option value="United States">United States (USA)</option>
                            <option value="Australia">Australia</option>
                            <option value="Dubai / UAE">Dubai / UAE</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="Europe / Germany">Europe / Germany</option>
                            <option value="Open to Recommendation">Open to Recommendation</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                            Preferred Channel
                          </label>
                          <select
                            value={bookingData.preferredContactMethod}
                            onChange={(e) => setBookingData({ ...bookingData, preferredContactMethod: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                          >
                            <option value="WhatsApp">WhatsApp Message / Call</option>
                            <option value="Phone Call">Direct Phone Call</option>
                            <option value="Email">Email Roadmap</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                          Brief Requirements / Degree / Role
                        </label>
                        <input
                          type="text"
                          value={bookingData.requirements}
                          onChange={(e) => setBookingData({ ...bookingData, requirements: e.target.value })}
                          placeholder="e.g. Master's in Computer Science, Fall 2026 intake"
                          className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C6A45C]"
                        />
                      </div>

                      <div className="pt-1 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBookingForm(false)}
                          className="px-3 py-1.5 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={bookingLoading}
                          className="px-4 py-1.5 bg-[#C6A45C] hover:bg-amber-600 text-[#0B1B33] font-bold rounded-lg text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {bookingLoading ? (
                            <span>Submitting...</span>
                          ) : (
                            <>
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Confirm Booking</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Chips Bar (Initial or Contextual) */}
              <div className="px-3 py-2 bg-white dark:bg-[#09172B] border-t border-slate-200/90 dark:border-navy-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-[10px] uppercase font-bold text-[#C6A45C] shrink-0 tracking-wider">
                  Quick:
                </span>
                <button
                  onClick={() => handleSendMessage('I want to study in the UK or Canada')}
                  className="bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:bg-[#C6A45C] hover:text-white dark:hover:bg-[#C6A45C] px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium shrink-0"
                >
                  🎓 Admissions
                </button>
                <button
                  onClick={() => handleSendMessage('I am looking for a job in Dubai')}
                  className="bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:bg-[#C6A45C] hover:text-white dark:hover:bg-[#C6A45C] px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium shrink-0"
                >
                  💼 Dubai Jobs
                </button>
                <button
                  onClick={() => handleSendMessage('How can I apply for a Dubai work visa?')}
                  className="bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:bg-[#C6A45C] hover:text-white dark:hover:bg-[#C6A45C] px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium shrink-0"
                >
                  🇦🇪 UAE Visas
                </button>
                <button
                  onClick={() => handleSendMessage('I am an employer looking for candidates')}
                  className="bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:bg-[#C6A45C] hover:text-white dark:hover:bg-[#C6A45C] px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium shrink-0"
                >
                  🤝 Hiring
                </button>
                <button
                  onClick={() => handleSendMessage('I want to prepare for IELTS')}
                  className="bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 hover:bg-[#C6A45C] hover:text-white dark:hover:bg-[#C6A45C] px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium shrink-0"
                >
                  📝 IELTS
                </button>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-gold-400 hover:bg-[#C6A45C] hover:text-white border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-full whitespace-nowrap transition font-bold shrink-0 flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 text-[#C6A45C]" />
                  <span>Consultation</span>
                </button>
              </div>

              {/* Chat Input Area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 sm:p-3 bg-white dark:bg-[#0B1B33] border-t border-slate-200 dark:border-navy-800 flex gap-2 items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={loading}
                  placeholder="Ask about admissions, Dubai jobs, visas, or recruitment..."
                  className="flex-1 bg-slate-100 dark:bg-navy-950 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-300/80 dark:border-navy-700 rounded-xl px-3.5 py-2 text-xs sm:text-[13px] focus:outline-none focus:border-[#C6A45C] focus:ring-1 focus:ring-[#C6A45C] transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="p-2.5 bg-[#C6A45C] hover:bg-amber-600 active:scale-95 text-[#0B1B33] font-bold rounded-xl transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#0B1B33]" />
                </button>
              </form>

              {/* Executive Sub-Footer with Verified Links */}
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-[#071324] border-t border-slate-200/80 dark:border-navy-900 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  Official AI • The Revival International
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://wa.me/919003475405"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                  </a>
                  <span>•</span>
                  <a
                    href="tel:+919003475405"
                    className="hover:text-amber-600 dark:hover:text-gold-400 font-semibold transition"
                  >
                    +91 9003475405
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
