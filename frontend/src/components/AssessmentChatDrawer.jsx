import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

export function AssessmentChatDrawer({ assessmentId, assessmentNumber }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am your regulatory audit assistant for Assessment ${assessmentNumber}. You can ask about evaluated clauses, missing evidence, test parameters, or applicable standard rules.`,
      citations: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/v1/assessments/${assessmentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.answer,
            citations: data.citations || [],
            disclaimer: data.disclaimer,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: 'Unable to process query within current assessment context.',
            citations: [],
          },
        ]);
      }
    } catch (err) {
      console.warn('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xl border border-blue-400 transition"
      >
        <Bot className="w-4 h-4" />
        Assessment Assistant
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[520px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-xs">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <div>
            <h4 className="font-bold text-white">Assessment Auditor</h4>
            <span className="text-[10px] text-slate-400 font-mono">{assessmentNumber}</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1"
        >
          &times;
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/90">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl leading-relaxed text-xs ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none space-y-1.5'
              }`}
            >
              <p>{m.text}</p>
              {m.citations && m.citations.length > 0 && (
                <div className="pt-1.5 border-t border-slate-800 text-[10px] text-blue-300 font-mono space-y-0.5">
                  <span className="text-slate-500 uppercase block text-[9px]">Verified Source:</span>
                  {m.citations.map((c, cIdx) => (
                    <div key={cIdx}>
                      {c.standard ? `${c.standard} ` : ''}
                      {c.clause ? `Clause ${c.clause}` : ''} ({c.source})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-slate-400 text-xs italic">Consulting assessment records...</div>
        )}
      </div>

      {/* Footer / Input */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask why a clause requires testing..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
