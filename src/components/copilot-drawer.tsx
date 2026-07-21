'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Trash2, Sparkles, Terminal, ShieldAlert } from 'lucide-react';
import { useAppStore, Message } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';

// A lightweight, highly-robust regex-based markdown renderer in React
function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let isInTable = false;

  const renderTextWithFormatting = (str: string) => {
    // Basic bold **text** replacement
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-cyan-300 font-semibold">{part}</strong>;
      }
      // Basic italic *text* replacement
      const italicParts = part.split(/\*([^*]+)\*/g);
      return italicParts.map((ip, i) => {
        if (i % 2 === 1) {
          return <em key={i} className="text-slate-300 italic">{ip}</em>;
        }
        return ip;
      });
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Table Detector
    if (trimmed.startsWith('|')) {
      if (trimmed.includes('---')) {
        // Table divider, skip rendering
        return;
      }
      isInTable = true;
      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter((_, i, arr) => i > 0 && i < arr.length - 1);
      tableRows.push(cells);
      return;
    } else if (isInTable) {
      // End of table block
      renderedElements.push(
        <div key={`table-${idx}`} className="my-4 overflow-x-auto rounded-lg border border-white/5 bg-slate-950/40">
          <table className="min-w-full divide-y divide-white/5 text-left text-xs">
            <thead className="bg-white/5 font-semibold text-slate-300">
              <tr>
                {tableRows[0]?.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3 py-2">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-400">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 align-top">{renderTextWithFormatting(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      isInTable = false;
    }

    if (trimmed === '') {
      renderedElements.push(<div key={`br-${idx}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={idx} className="text-lg font-bold text-white mt-4 mb-2 border-b border-white/5 pb-1">
          {renderTextWithFormatting(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={idx} className="text-md font-bold text-white mt-4 mb-1">
          {renderTextWithFormatting(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} className="text-sm font-semibold text-violet-400 mt-3 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          {renderTextWithFormatting(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={idx} className="text-xs font-bold text-cyan-400 mt-2 mb-1 uppercase font-mono">
          {renderTextWithFormatting(trimmed.substring(5))}
        </h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <li key={idx} className="ml-4 list-disc text-xs text-slate-300 mb-1 pl-1">
          {renderTextWithFormatting(trimmed.substring(2))}
        </li>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      renderedElements.push(
        <div key={idx} className="ml-4 text-xs text-slate-300 mb-1 flex gap-1">
          <span className="font-mono text-cyan-500 font-bold">{match?.[1]}.</span>
          <span>{renderTextWithFormatting(match?.[2] || '')}</span>
        </div>
      );
    } else {
      renderedElements.push(
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-1.5">
          {renderTextWithFormatting(line)}
        </p>
      );
    }
  });

  // Flush table if message ends with table
  if (isInTable && tableRows.length > 0) {
    renderedElements.push(
      <div key="table-end" className="my-4 overflow-x-auto rounded-lg border border-white/5 bg-slate-950/40">
        <table className="min-w-full divide-y divide-white/5 text-left text-xs">
          <thead className="bg-white/5 font-semibold text-slate-300">
            <tr>
              {tableRows[0]?.map((cell, cIdx) => (
                <th key={cIdx} className="px-3 py-2">{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-slate-400">
            {tableRows.slice(1).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-2 align-top">{renderTextWithFormatting(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="space-y-1.5">{renderedElements}</div>;
}

export default function CopilotDrawer() {
  const { isCopilotOpen, toggleCopilot, copilotMessages, addCopilotMessage, clearCopilotHistory } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const defaultQuestions = [
    'What is blocking Sprint 10?',
    'Which developer is overloaded?',
    'Predict sprint completion.',
    'Show biggest risks.',
    'Why is velocity decreasing?',
    'Generate executive summary.',
  ];

  const quickQuestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : defaultQuestions;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isCopilotOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isCopilotOpen, copilotMessages]);

  // Build Gemini-compatible chat history from messages in state
  const buildHistory = () => {
    const msgs = copilotMessages.filter(m => m.text !== copilotMessages[0]?.text); // skip welcome
    return msgs.map((m: Message) => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }],
    }));
  };

  // AI API Call Mutation
  const copilotMutation = useMutation({
    mutationFn: async (queryText: string) => {
      const history = buildHistory();
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, history }),
      });
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
    onSuccess: (data) => {
      addCopilotMessage('bot', data.answer);
      if (data.suggestedQuestions?.length > 0) {
        setDynamicSuggestions(data.suggestedQuestions);
      }
    },
    onError: () => {
      addCopilotMessage('bot', `🔴 **AI Error**: Failed to reach Gemini. Please check that your API key is valid and try again.`);
    },
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || copilotMutation.isPending) return;

    // Add user message to state
    addCopilotMessage('user', text);
    setInputValue('');

    // Trigger AI API call
    copilotMutation.mutate(text);
  };

  return (
    <AnimatePresence>
      {isCopilotOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCopilot(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-45"
          />

          {/* Chat Container Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 w-[480px] max-w-full h-screen bg-slate-950/80 backdrop-blur-xl border-l border-white/10 flex flex-col z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-violet-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Sprint Copilot
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] text-slate-400 font-mono">Agent: Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearCopilotHistory}
                  title="Clear history"
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleCopilot(false)}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {copilotMessages.map((msg: Message) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <span className="text-[9px] text-slate-500 font-mono mb-1 px-1">
                    {msg.sender === 'user' ? 'You' : 'Copilot AI'} • {msg.timestamp}
                  </span>

                  <div
                    className={`rounded-2xl px-3.5 py-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-600/10'
                        : 'bg-glass border border-white/5 text-slate-200 glow-secondary'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="whitespace-pre-line font-medium">{msg.text}</p>
                    ) : (
                      <Markdown text={msg.text} />
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {copilotMutation.isPending && (
                <div className="flex flex-col items-start max-w-[85%] mr-auto">
                  <span className="text-[9px] text-slate-500 font-mono mb-1">
                    Copilot AI is analyzing data...
                  </span>
                  <div className="bg-glass border border-white/5 rounded-2xl px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 py-2 bg-slate-900/30 border-t border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block mb-1.5">
                Suggested queries
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    disabled={copilotMutation.isPending}
                    onClick={() => handleSendMessage(q)}
                    className="text-[10px] text-violet-300 bg-violet-950/20 hover:bg-violet-900/30 border border-violet-500/20 hover:border-violet-500/40 rounded-full px-2.5 py-1 transition text-left cursor-pointer disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-4 border-t border-white/5 bg-slate-950 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Copilot about blockers, workload, completion..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={copilotMutation.isPending}
                className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 hover:border-white/20 focus:border-violet-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || copilotMutation.isPending}
                className="w-10 h-10 shrink-0 bg-violet-600 hover:bg-violet-500 disabled:bg-white/5 disabled:text-slate-600 text-white rounded-xl flex items-center justify-center transition shadow-lg shadow-violet-600/10 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
