'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import {
  FileText,
  Bot,
  Copy,
  Download,
  Check,
  Cpu,
  Sparkles,
  RefreshCw,
  Terminal,
} from 'lucide-react';

// Lightweight regex markdown renderer (reused for reports page consistency)
function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let isInTable = false;

  const renderTextWithFormatting = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-cyan-300 font-semibold">{part}</strong>;
      }
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

    if (trimmed.startsWith('|')) {
      if (trimmed.includes('---')) return;
      isInTable = true;
      const cells = line
        .split('|')
        .map(c => c.trim())
        .filter((_, i, arr) => i > 0 && i < arr.length - 1);
      tableRows.push(cells);
      return;
    } else if (isInTable) {
      renderedElements.push(
        <div key={`table-${idx}`} className="my-4 overflow-x-auto rounded-xl border border-white/5 bg-slate-950/60">
          <table className="min-w-full divide-y divide-white/5 text-left text-xs">
            <thead className="bg-white/5 font-semibold text-slate-200">
              <tr>
                {tableRows[0]?.map((cell, cIdx) => (
                  <th key={cIdx} className="px-4 py-3">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-300">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5 align-top">{renderTextWithFormatting(cell)}</td>
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
      renderedElements.push(<div key={`br-${idx}`} className="h-2.5" />);
      return;
    }

    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={idx} className="text-xl font-bold text-white mt-5 mb-3 border-b border-white/10 pb-1.5 glow-text-primary">
          {renderTextWithFormatting(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={idx} className="text-base font-bold text-white mt-4 mb-2">
          {renderTextWithFormatting(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} className="text-xs font-semibold text-cyan-400 mt-3 mb-2 flex items-center gap-1.5 uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          {renderTextWithFormatting(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={idx} className="text-xs font-bold text-slate-400 mt-3 mb-1 uppercase font-mono">
          {renderTextWithFormatting(trimmed.substring(5))}
        </h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <li key={idx} className="ml-5 list-disc text-xs text-slate-300 mb-1.5 pl-1 leading-relaxed">
          {renderTextWithFormatting(trimmed.substring(2))}
        </li>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      renderedElements.push(
        <div key={idx} className="ml-5 text-xs text-slate-300 mb-1.5 flex gap-1 leading-relaxed">
          <span className="font-mono text-cyan-400 font-bold">{match?.[1]}.</span>
          <span>{renderTextWithFormatting(match?.[2] || '')}</span>
        </div>
      );
    } else {
      renderedElements.push(
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2.5">
          {renderTextWithFormatting(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1.5">{renderedElements}</div>;
}

export default function Reports() {
  const [activeReportId, setActiveReportId] = useState('executive');
  const [reportContent, setReportContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const reportTabs = [
    { id: 'executive', name: 'Executive Summary', prompt: 'Generate executive summary.' },
    { id: 'standup', name: 'Daily Standup Notes', prompt: 'Generate daily standup notes.' },
    { id: 'retrospective', name: 'Retrospective Summary', prompt: 'Generate retrospective summary.' },
    { id: 'release', name: 'Release Readiness', prompt: 'Generate release readiness report.' },
  ];

  // API query trigger
  const generateMutation = useMutation({
    mutationFn: async (queryPrompt: string) => {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryPrompt }),
      });
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
    onSuccess: (data) => {
      setReportContent(data.answer);
    },
  });

  const handleGenerateReport = () => {
    const tab = reportTabs.find((t) => t.id === activeReportId);
    if (tab) {
      generateMutation.mutate(tab.prompt);
    }
  };

  const handleCopyClipboard = () => {
    if (!reportContent) return;
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!reportContent) return;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sprint_Intelligence_Report_${activeReportId}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">AI Report Orchestration</h1>
          <p className="text-xs text-slate-400">
            Generate and export premium markdown documents for stakeholders and developers using local AI intelligence.
          </p>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Report Selectors */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
              Report Templates
            </h3>
            
            <div className="flex flex-col gap-1.5">
              {reportTabs.map((tab) => {
                const isActive = tab.id === activeReportId;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveReportId(tab.id);
                      setReportContent(''); // Reset on switch
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-left transition duration-300 relative cursor-pointer ${
                      isActive
                        ? 'text-white bg-gradient-to-r from-violet-600/20 to-cyan-500/5 border-l-2 border-violet-500'
                        : 'text-slate-400 hover:text-slate-200 bg-white/5 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <FileText className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Generate Trigger */}
            <button
              onClick={handleGenerateReport}
              disabled={generateMutation.isPending}
              className="w-full mt-4 flex items-center justify-center gap-2.5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white text-xs font-bold shadow-lg shadow-violet-600/10 cursor-pointer"
            >
              <Cpu className={`w-4 h-4 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{generateMutation.isPending ? 'Compiling Report...' : 'Compile Report with AI'}</span>
            </button>
          </div>

          {/* Right Columns: Report Viewer Panel */}
          <div className="xl:col-span-3 bg-glass rounded-2xl border border-white/5 p-6 min-h-[500px] flex flex-col justify-between">
            {generateMutation.isPending ? (
              // Loading Skeleton
              <div className="flex-1 flex flex-col justify-center items-center py-20 gap-4">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-2 border-violet-500/15" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 border-r-2 border-r-violet-500/50 animate-spin" />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-white block">Synthesizing Sprint Telemetry</span>
                  <span className="text-[10px] text-slate-500 font-mono">Running local markdown compile passes...</span>
                </div>
              </div>
            ) : reportContent ? (
              // Report Output Display
              <div className="flex-1 flex flex-col justify-between h-full">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-[10px] font-semibold bg-cyan-500/5 border border-cyan-500/10 rounded px-2.5 py-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Markdown Build: Success</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyClipboard}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg border border-white/5 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      title="Copy to Clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownloadReport}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg border border-white/5 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      title="Download Markdown File"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>

                {/* Markdown text */}
                <div className="flex-1 overflow-y-auto max-h-[500px] border border-white/5 bg-slate-950/20 p-5 rounded-xl">
                  <Markdown text={reportContent} />
                </div>
              </div>
            ) : (
              // Placeholder State
              <div className="flex-1 flex flex-col justify-center items-center py-20 gap-3 text-slate-500 italic text-center">
                <Bot className="w-12 h-12 text-slate-600 animate-bounce" />
                <div>
                  <span className="text-xs font-bold block text-slate-400">Template Ready for Generation</span>
                  <span className="text-[10px] text-slate-500 block">Click the left button to compile this report using local AI metrics.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
