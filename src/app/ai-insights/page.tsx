'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useQuery } from '@tanstack/react-query';
import {
  Brain, Sparkles, AlertTriangle, Lightbulb, TrendingUp,
  FileText, RefreshCw, ChevronDown, CheckCircle2, XCircle,
  Users, Activity, Zap, Target, Send, BarChart3, Shield,
  Settings2, ToggleLeft, ToggleRight, Copy, Check,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────
interface InsightWidget {
  id: string;
  title: string;
  icon: React.ElementType;
  prompt: string;
  color: string;
  bg: string;
  border: string;
  enabled: boolean;
}

// ── Markdown renderer ──────────────────────────────────────────────
function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (trimmed.startsWith('### ')) return <h3 key={i} className="text-base font-bold mt-3 mb-1" style={{ color: 'var(--color-accent)' }}>{trimmed.slice(4)}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="text-lg font-bold mt-4 mb-1" style={{ color: 'var(--color-foreground)' }}>{trimmed.slice(3)}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-4 mb-2" style={{ color: 'var(--color-foreground)' }}>{trimmed.slice(2)}</h1>;
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.slice(2);
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span style={{ color: 'var(--color-accent)' }} className="mt-1.5 shrink-0">•</span>
              <span style={{ color: 'var(--color-foreground)', opacity: 0.85 }} dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          );
        }
        return (
          <p key={i} style={{ color: 'var(--color-foreground)', opacity: 0.80 }}
            dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong style="opacity:1;color:var(--color-foreground)">$1</strong>') }} />
        );
      })}
    </div>
  );
}

// ── Individual Widget ──────────────────────────────────────────────
function InsightCard({ widget }: { widget: InsightWidget }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: widget.prompt, type: widget.id }),
      });
      const data = await res.json();
      setContent(data.result || data.error || 'No response from AI.');
      setGenerated(true);
    } catch {
      setContent('❌ Failed to connect to AI. Please check your API key.');
    } finally {
      setLoading(false);
    }
  }, [widget]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = widget.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--color-primary)',
        border: `1px solid ${widget.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Card Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid var(--color-border)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: widget.bg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: widget.color + '22',
            border: `1px solid ${widget.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon style={{ width: '18px', height: '18px', color: widget.color }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-foreground)' }}>
              {widget.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '1px' }}>
              Powered by Gemini 2.0 Flash
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {generated && (
            <button onClick={handleCopy} title="Copy" style={{
              padding: '6px', borderRadius: '8px', border: '1px solid var(--color-border)',
              background: 'var(--color-primary)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '4px',
            }}>
              {copied ? <Check style={{ width: '14px', color: '#22c55e' }} /> : <Copy style={{ width: '14px', color: 'var(--color-muted)' }} />}
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'var(--color-secondary)' : widget.color,
              color: '#fff', fontSize: '12px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px', transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <><RefreshCw style={{ width: '12px' }} className="animate-spin" /> Analyzing...</>
            ) : generated ? (
              <><RefreshCw style={{ width: '12px' }} /> Refresh</>
            ) : (
              <><Sparkles style={{ width: '12px' }} /> Generate</>
            )}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px', flex: 1, minHeight: '120px' }}>
        {!generated && !loading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100px', gap: '8px', opacity: 0.5,
          }}>
            <Icon style={{ width: '28px', height: '28px', color: widget.color }} />
            <p style={{ fontSize: '13px', color: 'var(--color-muted)', textAlign: 'center' }}>
              Click <strong>Generate</strong> to get AI analysis
            </p>
          </div>
        )}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0' }}>
            {[100, 85, 90, 70, 75].map((w, i) => (
              <div key={i} style={{
                height: '12px', borderRadius: '6px', width: `${w}%`,
                background: `linear-gradient(90deg, var(--color-secondary) 25%, var(--color-border) 50%, var(--color-secondary) 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }} />
            ))}
          </div>
        )}
        {generated && !loading && <Markdown text={content} />}
      </div>
    </motion.div>
  );
}

// ── AI Chat Section ────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'ai'; text: string; }

function AIChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const suggested = [
    'Summarize the current sprint health in 3 bullet points.',
    'Who is most likely to burn out this sprint?',
    'What are the top 3 risks to delivery?',
    'Compare last 3 sprint velocities.',
    'Write a standup report for today.',
    'What should the team focus on tomorrow?',
  ];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }],
    }));

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: text, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer || data.error }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Failed to connect to Gemini AI.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <div style={{
      background: 'var(--color-primary)', border: '1px solid var(--color-border)',
      borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '600px',
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.05) 100%)',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99,102,241,0.3)',
        }}>
          <Brain style={{ width: '20px', color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-foreground)' }}>
            Sprint Intelligence AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} className="animate-pulse" />
            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>Gemini 2.0 Flash · Full sprint context loaded</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', opacity: 0.6 }}>
            <Brain style={{ width: '40px', height: '40px', color: '#6366f1' }} />
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', textAlign: 'center' }}>
              Ask me anything about your sprint data.<br />I have full context of your sprints, issues, and team.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'var(--color-secondary)',
              border: msg.role === 'ai' ? '1px solid var(--color-border)' : 'none',
            }}>
              {msg.role === 'user' ? (
                <p style={{ color: '#fff', fontSize: '13px', margin: 0 }}>{msg.text}</p>
              ) : (
                <Markdown text={msg.text} />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '6px', padding: '12px 16px', background: 'var(--color-secondary)', border: '1px solid var(--color-border)', borderRadius: '16px 16px 16px 4px', width: 'fit-content' }}>
            {[0, 150, 300].map(delay => (
              <span key={delay} style={{
                width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1',
                animation: 'bounce 1.2s infinite', animationDelay: `${delay}ms`,
              }} />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--color-border)' }}>
          {suggested.map((q, i) => (
            <button key={i} onClick={() => send(q)} disabled={loading} style={{
              padding: '5px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer',
              background: 'var(--color-secondary)', color: 'var(--color-muted)',
              border: '1px solid var(--color-border)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#6366f1')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(input); }} style={{
        padding: '12px 16px', borderTop: '1px solid var(--color-border)',
        display: 'flex', gap: '10px', alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about your sprint, team, risks, or blockers..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: '12px', fontSize: '13px',
            background: 'var(--color-secondary)', border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)', outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#6366f1')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        />
        <button type="submit" disabled={!input.trim() || loading} style={{
          width: '40px', height: '40px', borderRadius: '12px', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
          background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--color-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0,
        }}>
          <Send style={{ width: '16px', color: '#fff' }} />
        </button>
      </form>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
export default function AIInsightsPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [widgets, setWidgets] = useState<InsightWidget[]>([
    {
      id: 'health',
      title: 'Sprint Health Assessment',
      icon: Shield,
      color: '#22c55e',
      bg: 'linear-gradient(135deg, rgba(34,197,94,0.04) 0%, transparent 100%)',
      border: 'rgba(34,197,94,0.20)',
      enabled: true,
      prompt: 'Perform a comprehensive sprint health assessment. Cover: current sprint status, completion probability, team morale indicators, burndown progress, and overall health score with specific reasoning. Format with clear sections and bullet points.',
    },
    {
      id: 'risks',
      title: 'Risk Radar',
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'linear-gradient(135deg, rgba(239,68,68,0.04) 0%, transparent 100%)',
      border: 'rgba(239,68,68,0.20)',
      enabled: true,
      prompt: 'Identify and analyze the top risks threatening this sprint. For each risk: severity (High/Medium/Low), likelihood, business impact, and mitigation action. Include risks from blockers, overloaded developers, scope, and velocity trends.',
    },
    {
      id: 'recommendations',
      title: 'AI Recommendations',
      icon: Lightbulb,
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 100%)',
      border: 'rgba(245,158,11,0.20)',
      enabled: true,
      prompt: 'Generate 5-7 specific, actionable recommendations for the scrum master and team lead to improve this sprint outcome. Each recommendation should include: the problem, the action, who should do it, and expected impact. Be very specific using the actual data.',
    },
    {
      id: 'team',
      title: 'Team Performance Analysis',
      icon: Users,
      color: '#6366f1',
      bg: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, transparent 100%)',
      border: 'rgba(99,102,241,0.20)',
      enabled: true,
      prompt: 'Analyze each developer\'s performance, workload, and wellbeing. Identify who is overloaded, underutilized, performing exceptionally well, or at risk of burnout. Include specific story point data and utilization percentages. Suggest load rebalancing actions.',
    },
    {
      id: 'velocity',
      title: 'Velocity & Trend Analysis',
      icon: TrendingUp,
      color: '#0ea5e9',
      bg: 'linear-gradient(135deg, rgba(14,165,233,0.04) 0%, transparent 100%)',
      border: 'rgba(14,165,233,0.20)',
      enabled: true,
      prompt: 'Analyze sprint velocity trends across all historical sprints. Calculate average velocity, trend direction (improving/declining), predict next sprint capacity, and identify root causes of velocity changes. Include a commitment vs completion analysis.',
    },
    {
      id: 'executive',
      title: 'Executive Summary Report',
      icon: FileText,
      color: '#8b5cf6',
      bg: 'linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 100%)',
      border: 'rgba(139,92,246,0.20)',
      enabled: true,
      prompt: 'Write a professional executive summary report for senior stakeholders. Include: sprint overview, key metrics, delivery confidence, major risks, team status, and recommended decisions. Use a formal, concise tone suitable for C-level presentation. Make it data-rich and specific.',
    },
  ]);

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  const enabledWidgets = widgets.filter(w => w.enabled);

  return (
    <DashboardLayout>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>

      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 32px rgba(99,102,241,0.35)',
              }}>
                <Brain style={{ width: '26px', color: '#fff' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px', fontWeight: 800, margin: 0,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  AI Insights
                </h1>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-muted)', marginTop: '3px' }}>
                  Powered by Gemini 2.0 Flash · Full sprint context · Real-time analysis
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowSettings(s => !s)}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--color-border)',
                  background: 'var(--color-primary)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-foreground)',
                  transition: 'all 0.2s',
                }}
              >
                <Settings2 style={{ width: '15px' }} />
                Customize Widgets
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Widget Settings Panel ── */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'var(--color-primary)', border: '1px solid var(--color-border)',
                borderRadius: '14px', padding: '20px', marginBottom: '24px', overflow: 'hidden',
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 700, color: 'var(--color-foreground)' }}>
                ⚙️ Visible Widgets
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {widgets.map(w => {
                  const Icon = w.icon;
                  return (
                    <button key={w.id} onClick={() => toggleWidget(w.id)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                      background: w.enabled ? w.bg : 'var(--color-secondary)',
                      border: `1px solid ${w.enabled ? w.border : 'var(--color-border)'}`,
                      transition: 'all 0.2s', textAlign: 'left',
                    }}>
                      <Icon style={{ width: '16px', color: w.enabled ? w.color : 'var(--color-muted)', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', flex: 1, color: 'var(--color-foreground)', fontWeight: 500 }}>{w.title}</span>
                      {w.enabled
                        ? <ToggleRight style={{ width: '20px', color: w.color, flexShrink: 0 }} />
                        : <ToggleLeft style={{ width: '20px', color: 'var(--color-muted)', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Grid: Chat + Widgets ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <AIChat />
          </div>
        </div>

        {/* ── Analysis Widgets ── */}
        {enabledWidgets.length > 0 && (
          <>
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles style={{ width: '18px', color: '#6366f1' }} />
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-foreground)' }}>
                On-Demand Analysis Widgets
              </h2>
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(99,102,241,0.10)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.20)',
              }}>
                {enabledWidgets.length} active
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
              {enabledWidgets.map(widget => (
                <InsightCard key={widget.id} widget={widget} />
              ))}
            </div>
          </>
        )}

        {enabledWidgets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', opacity: 0.5 }}>
            <ToggleLeft style={{ width: '40px', margin: '0 auto 12px', display: 'block', color: 'var(--color-muted)' }} />
            <p style={{ color: 'var(--color-muted)' }}>All widgets are disabled. Click "Customize Widgets" to re-enable them.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
