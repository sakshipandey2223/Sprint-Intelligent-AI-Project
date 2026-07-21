'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Send, Trash2, Sparkles, Terminal, ShieldAlert, 
  Zap, Cpu, CheckCircle2, Sliders, AlertTriangle, 
  Activity, Info
} from 'lucide-react';
import { useAppStore, Message } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';

// A lightweight, highly-robust regex-based markdown renderer in React
function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let isInTable = false;
  let isInCode = false;
  let codeBlockLines: string[] = [];

  const renderTextWithFormatting = (str: string) => {
    // Bold **text**
    const boldParts = str.split(/\*\*([^*]+)\*\*/g);
    return boldParts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} style={{ color: 'var(--color-accent, #6366f1)', fontWeight: 700 }}>{part}</strong>;
      }
      
      // Inline code `code`
      const codeParts = part.split(/`([^`]+)`/g);
      return codeParts.map((cp, cidx) => {
        if (cidx % 2 === 1) {
          return (
            <code key={cidx} className="px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ background: 'var(--color-markdown-code-bg, rgba(255,255,255,0.06))', color: '#ec4899' }}>
              {cp}
            </code>
          );
        }

        // Italic *text*
        const italicParts = cp.split(/\*([^*]+)\*/g);
        return italicParts.map((ip, i) => {
          if (i % 2 === 1) {
            return <em key={i} className="font-sans text-slate-400 italic">{ip}</em>;
          }
          return ip;
        });
      });
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (isInCode) {
        // End of code block
        renderedElements.push(
          <div key={`code-${idx}`} className="my-2 p-3 rounded-lg border border-white/5 bg-black/40 font-mono text-[11px] text-emerald-400 overflow-x-auto">
            <pre className="m-0 leading-relaxed">{codeBlockLines.join('\n')}</pre>
          </div>
        );
        codeBlockLines = [];
        isInCode = false;
      } else {
        isInCode = true;
      }
      return;
    }

    if (isInCode) {
      codeBlockLines.push(line);
      return;
    }

    // Table Detector
    if (trimmed.startsWith('|')) {
      if (trimmed.includes('---')) {
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
      renderedElements.push(
        <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-card-border)', background: 'rgba(0,0,0,0.1)' }}>
          <table className="min-w-full divide-y text-left text-[11px]" style={{ divideColor: 'var(--color-card-border)' }}>
            <thead>
              <tr style={{ background: 'var(--color-markdown-table-thead-bg, rgba(255,255,255,0.03))' }}>
                {tableRows[0]?.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3 py-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ divideColor: 'var(--color-card-border)' }}>
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-1.5 align-top" style={{ color: 'var(--color-text-secondary)' }}>{renderTextWithFormatting(cell)}</td>
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
      renderedElements.push(<div key={`br-${idx}`} className="h-1.5" />);
      return;
    }

    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={idx} className="text-md font-extrabold mt-3 mb-1.5 pb-1 border-b" style={{ color: 'var(--color-text-primary)', borderColor: 'var(--color-card-border)' }}>
          {renderTextWithFormatting(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={idx} className="text-sm font-bold mt-3 mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {renderTextWithFormatting(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} className="text-xs font-semibold text-violet-400 mt-2 mb-1 flex items-center gap-1.5 uppercase tracking-wider font-mono">
          <Sparkles className="w-3 h-3 text-violet-400" />
          {renderTextWithFormatting(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <li key={idx} className="ml-3 list-disc text-xs mb-0.5 pl-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          {renderTextWithFormatting(trimmed.substring(2))}
        </li>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      renderedElements.push(
        <div key={idx} className="ml-3 text-xs mb-0.5 flex gap-1.5">
          <span className="font-mono text-cyan-500 font-bold">{match?.[1]}.</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{renderTextWithFormatting(match?.[2] || '')}</span>
        </div>
      );
    } else {
      renderedElements.push(
        <p key={idx} className="text-xs leading-relaxed mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          {renderTextWithFormatting(line)}
        </p>
      );
    }
  });

  // Flush table if message ends with table
  if (isInTable && tableRows.length > 0) {
    renderedElements.push(
      <div key="table-end" className="my-3 overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--color-card-border)', background: 'rgba(0,0,0,0.1)' }}>
        <table className="min-w-full divide-y text-left text-[11px]" style={{ divideColor: 'var(--color-card-border)' }}>
          <thead>
            <tr style={{ background: 'var(--color-markdown-table-thead-bg, rgba(255,255,255,0.03))' }}>
              {tableRows[0]?.map((cell, cIdx) => (
                <th key={cIdx} className="px-3 py-2 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ divideColor: 'var(--color-card-border)' }}>
            {tableRows.slice(1).map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-3 py-1.5 align-top" style={{ color: 'var(--color-text-secondary)' }}>{renderTextWithFormatting(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="space-y-1">{renderedElements}</div>;
}

const PERSONAS = [
  { 
    id: 'scrum', 
    name: 'Scrum Master', 
    desc: 'Flow & Velocity Coach', 
    icon: Bot, 
    color: '#2dd4a7', 
    promptSuffix: '\nFormat your response as an expert Agile Coach/Scrum Master. Prioritize workflow velocity, team efficiency, and removing delivery blockers.' 
  },
  { 
    id: 'risk', 
    name: 'Risk Analyst', 
    desc: 'Capacity & Impediments', 
    icon: ShieldAlert, 
    color: '#ef4444', 
    promptSuffix: '\nFormat your response as a Senior Project Delivery Risk Analyst. Prioritize highlighting capacity overflow, delivery confidence, and critical blockers.' 
  },
  { 
    id: 'devops', 
    name: 'DevOps Engine', 
    desc: 'Telemetry & Infrastructure', 
    icon: Terminal, 
    color: '#6366f1', 
    promptSuffix: '\nFormat your response as a DevOps Platform Engineer. Focus on continuous deployment, container telemetry, and cloud systems.' 
  }
];

const QUICK_COMMANDS = [
  { cmd: '/summary', label: 'Executive Summary', icon: Bot, query: 'Generate an executive summary report for the current active sprint.' },
  { cmd: '/blockers', label: 'Analyze Blockers', icon: ShieldAlert, query: 'What is blocking the current sprint? Provide blocker details and suggested fixes.' },
  { cmd: '/predict', label: 'Sprint Forecast', icon: Zap, query: 'Analyze current velocity and capacity to forecast whether we will complete all story points.' },
  { cmd: '/workload', label: 'Developer Workload', icon: Cpu, query: 'Which developers are overloaded and who has extra capacity to assist?' },
];

export default function CopilotDrawer() {
  const { isCopilotOpen, toggleCopilot, copilotMessages, addCopilotMessage, clearCopilotHistory, theme } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [activePersona, setActivePersona] = useState<'scrum' | 'risk' | 'devops'>('scrum');
  const [showConfig, setShowConfig] = useState(false);
  const [aiSensitivity, setAiSensitivity] = useState(75);
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [showSlashMenu, setShowSlashMenu] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

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
        body: JSON.stringify({ 
          query: queryText, 
          history,
          sensitivity: aiSensitivity,
          temperature: aiTemperature
        }),
      });
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
    onSuccess: (data) => {
      addCopilotMessage('bot', data.answer);
    },
    onError: () => {
      addCopilotMessage('bot', `🔴 **AI Error**: Failed to reach telemetry engine. Please check system configurations and try again.`);
    },
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim() || copilotMutation.isPending) return;

    // Append persona instructions for specialized model feedback
    const persona = PERSONAS.find(p => p.id === activePersona);
    const formattedText = text.trim();
    const queryForApi = formattedText + (persona ? persona.promptSuffix : '');

    // Add user message to UI state (without the system suffix to keep chat clean)
    addCopilotMessage('user', formattedText);
    setInputValue('');
    setShowSlashMenu(false);

    // Trigger AI API call
    copilotMutation.mutate(queryForApi);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (val.startsWith('/')) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const currentPersonaInfo = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

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
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-45"
          />

          {/* Chat Container Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`fixed top-0 right-0 w-[500px] max-w-full h-screen border-l flex flex-col z-50 shadow-2xl transition-colors duration-300 ${
              isDark 
                ? 'bg-slate-950/90 border-white/10 text-slate-100' 
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Header HUD panel */}
            <div className="p-4 border-b flex flex-col gap-3" style={{ borderColor: 'var(--color-card-border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                    style={{ 
                      background: `${currentPersonaInfo.color}20`, 
                      border: `1px solid ${currentPersonaInfo.color}40`,
                      boxShadow: `0 0 15px ${currentPersonaInfo.color}25`
                    }}
                  >
                    <Bot className="w-5 h-5 animate-pulse" style={{ color: currentPersonaInfo.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                      Sprint Copilot
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v2.1</span>
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-muted)' }}>HUD Live</span>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">•</span>
                      <span className="text-[9px] font-mono" style={{ color: 'var(--color-text-muted)' }}>Model: Groq LLaMA 3.3</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowConfig(!showConfig)}
                    title="AI Engine Parameters"
                    className="p-2 hover:bg-white/5 rounded-xl transition-all"
                    style={{ color: showConfig ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearCopilotHistory}
                    title="Wipe conversation logs"
                    className="p-2 hover:bg-white/5 rounded-xl transition"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <Trash2 className="w-4 h-4 hover:text-red-400 transition-colors" />
                  </button>
                  <button
                    onClick={() => toggleCopilot(false)}
                    className="p-2 hover:bg-white/5 rounded-xl transition"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <X className="w-4 h-4 hover:text-white transition-colors" />
                  </button>
                </div>
              </div>

              {/* Collapsible Sliders Settings */}
              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden rounded-xl p-3 text-[11px] border"
                    style={{ 
                      background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                      borderColor: 'var(--color-card-border)'
                    }}
                  >
                    <h4 className="font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-primary)' }}>
                      <Activity className="w-3.5 h-3.5 text-violet-400" />
                      AI Core Parameters Control
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: 'var(--color-text-secondary)' }}>Risk Sensitivity Rate</span>
                          <span className="font-mono text-violet-400">{aiSensitivity}%</span>
                        </div>
                        <input 
                          type="range" min="10" max="100" 
                          value={aiSensitivity} 
                          onChange={(e) => setAiSensitivity(Number(e.target.value))}
                          className="w-full accent-violet-500 h-1 rounded" 
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span style={{ color: 'var(--color-text-secondary)' }}>Temperature (Creativity)</span>
                          <span className="font-mono text-cyan-400">{aiTemperature}</span>
                        </div>
                        <input 
                          type="range" min="0.1" max="1.0" step="0.1" 
                          value={aiTemperature} 
                          onChange={(e) => setAiTemperature(Number(e.target.value))}
                          className="w-full accent-cyan-500 h-1 rounded" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Persona Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                {PERSONAS.map(p => {
                  const Icon = p.icon;
                  const isActive = activePersona === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActivePersona(p.id as any)}
                      className="py-1.5 px-2 rounded-lg text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer"
                      style={{
                        background: isActive ? (isDark ? 'rgba(255,255,255,0.08)' : '#ffffff') : 'transparent',
                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? p.color : 'var(--color-text-muted)' }} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {copilotMessages.map((msg: Message) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className={`flex flex-col max-w-[85%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <span className="text-[9px] font-mono mb-1 px-1" style={{ color: 'var(--color-text-faint)' }}>
                        {isUser ? 'You' : 'Sprint AI'} • {msg.timestamp}
                      </span>

                      <div
                        className="rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all shadow-md"
                        style={{
                          background: isUser 
                            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' 
                            : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                          border: isUser ? 'none' : '1px solid var(--color-card-border)',
                          color: isUser ? '#ffffff' : 'var(--color-text-secondary)',
                          boxShadow: isUser ? '0 4px 15px rgba(99, 102, 241, 0.2)' : 'none'
                        }}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-line font-medium">{msg.text}</p>
                        ) : (
                          <Markdown text={msg.text} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing / Thinking indicator */}
              {copilotMutation.isPending && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-start max-w-[90%] mr-auto"
                >
                  <span className="text-[9px] font-mono mb-1.5" style={{ color: 'var(--color-text-faint)' }}>
                    AI Telemetry Core Processing...
                  </span>
                  <div className="border rounded-2xl px-4 py-3 flex flex-col gap-2 relative overflow-hidden w-64 shadow-sm"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: 'var(--color-card-border)'
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                      <span className="text-[10px] font-mono animate-pulse" style={{ color: 'var(--color-text-muted)' }}>Running calculations...</span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden relative" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
                      <motion.div 
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-600 to-indigo-500"
                        initial={{ width: '0%' }}
                        animate={{ width: ['0%', '30%', '55%', '80%', '95%', '98%'] }}
                        transition={{ duration: 10, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Collapsible Slash Commands Panel */}
            <AnimatePresence>
              {showSlashMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mx-4 my-2 p-2 rounded-xl border flex flex-col gap-1 shadow-lg"
                  style={{
                    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                    borderColor: 'var(--color-card-border)'
                  }}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono p-1" style={{ color: 'var(--color-text-faint)' }}>
                    Quick Commands
                  </span>
                  {QUICK_COMMANDS.map((qc) => {
                    const CmdIcon = qc.icon;
                    return (
                      <button
                        key={qc.cmd}
                        onClick={() => handleSendMessage(qc.query)}
                        className="flex items-center justify-between p-2 rounded-lg text-left hover:bg-violet-600/10 hover:text-violet-400 transition group cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CmdIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400" />
                          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{qc.label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">{qc.cmd}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Suggestions Cards Grid */}
            {!showSlashMenu && copilotMessages.length === 1 && (
              <div className="p-4 border-t" style={{ borderColor: 'var(--color-card-border)' }}>
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono block mb-2" style={{ color: 'var(--color-text-faint)' }}>
                  Suggested queries
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_COMMANDS.map((qc, i) => {
                    const CardIcon = qc.icon;
                    return (
                      <button
                        key={i}
                        disabled={copilotMutation.isPending}
                        onClick={() => handleSendMessage(qc.query)}
                        className="p-3 rounded-xl border text-left flex flex-col gap-1 transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                          borderColor: 'var(--color-card-border)',
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <CardIcon className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-[10px] font-bold" style={{ color: 'var(--color-text-primary)' }}>{qc.cmd}</span>
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{qc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-4 border-t flex items-center gap-2"
              style={{ 
                borderColor: 'var(--color-card-border)',
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.01)'
              }}
            >
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask anything, or type '/' for quick commands..."
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={copilotMutation.isPending}
                  className="w-full bg-white/5 border rounded-xl px-4 py-3 text-xs outline-none transition-all"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderColor: 'var(--color-card-border)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowSlashMenu(!showSlashMenu)}
                  className="absolute right-3 p-1 rounded-lg text-xs font-mono font-bold hover:bg-white/5 transition"
                  style={{ color: 'var(--color-text-faint)' }}
                >
                  /
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || copilotMutation.isPending}
                className="w-10 h-10 shrink-0 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shadow-lg shadow-violet-600/10 cursor-pointer"
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
