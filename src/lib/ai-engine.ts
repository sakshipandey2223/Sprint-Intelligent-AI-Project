import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { getDashboardTelemetry } from './db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY   = process.env.GROQ_API_KEY   || '';

// Primary: Groq (free, ultra-fast — llama-3.3-70b)
// Fallback: Gemini 2.0 Flash
const PREFERRED_ENGINE: 'groq' | 'gemini' = GROQ_API_KEY ? 'groq' : 'gemini';

function buildSystemPrompt(): string {
  return `You are Sprint Intelligence AI — an expert Agile/Scrum coach and engineering analytics assistant embedded inside a Sprint KPI dashboard.

Your primary goal is to help engineering managers, scrum masters, and product owners understand their sprint health, team performance, risks, and velocity.

When answering:
- Be concise, specific, and actionable
- Use markdown formatting (bold, bullets, headers) for clarity
- Reference actual names, numbers, and sprint data from the context provided
- Offer specific recommendations and next steps
- When asked for reports (executive, standup, retrospective, release), generate comprehensive, professional-grade documents
- Sound like a trusted senior engineering advisor, not a generic chatbot

You have deep expertise in:
- Sprint velocity and burndown analysis
- Developer capacity planning and workload balancing
- Risk identification and blocker resolution
- Agile metrics (lead time, cycle time, throughput, defect density)
- Executive communication and stakeholder reporting`;
}

function buildContextPrompt(data: any): string {
  const active = data.sprints?.find((s: any) => s.status === 'active');
  const completed = data.sprints?.filter((s: any) => s.status === 'completed') || [];
  const blockedIssues = data.issues?.filter((i: any) => i.isBlocked) || [];
  const overloaded = data.developers?.filter((d: any) => d.assignedPoints > d.capacityPoints) || [];

  return `## Live Sprint Dashboard Context

### Active Sprint
${active ? JSON.stringify(active, null, 2) : 'No active sprint'}

### Completed Sprints (History)
${JSON.stringify(completed.slice(-3), null, 2)}

### All Developers & Workload
${JSON.stringify(data.developers, null, 2)}

### Blocked Issues (${blockedIssues.length} total)
${JSON.stringify(blockedIssues, null, 2)}

### Overloaded Developers (${overloaded.length} total)
${JSON.stringify(overloaded, null, 2)}

### Epics Progress
${JSON.stringify(data.epics, null, 2)}

### Analytics Summary
${JSON.stringify(data.analyticsSummary, null, 2)}

### All Issues in Active Sprint
${JSON.stringify(data.issues?.filter((i: any) => i.sprintId === active?.id), null, 2)}`;
}

// ── Groq engine (free, ultra-fast) ────────────────────────────────
async function callWithGroq(systemPrompt: string, userMessage: string, history: { role: string; content: string }[] = []): Promise<string> {
  const groq = new Groq({ apiKey: GROQ_API_KEY });
  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || 'No response from AI.';
}

// ── Gemini engine (fallback) ───────────────────────────────────────
async function callWithGemini(systemPrompt: string, userMessage: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []): Promise<string> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: systemPrompt });
  const chat = model.startChat({ history, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } });
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

// ── Main exported functions ────────────────────────────────────────
export async function callGeminiAI(
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<{ answer: string; suggestedQuestions: string[] }> {
  if (!GEMINI_API_KEY && !GROQ_API_KEY) {
    return {
      answer: '⚠️ **No AI key configured.** Please add `GROQ_API_KEY` or `GEMINI_API_KEY` to your environment variables.',
      suggestedQuestions: [],
    };
  }

  try {
    const data = await getDashboardTelemetry(null);
    const systemPrompt = buildSystemPrompt();
    const contextPrefix = buildContextPrompt(data);
    const fullUserMessage = chatHistory.length === 0
      ? `${contextPrefix}\n\n---\n\n## User Question\n${userMessage}`
      : userMessage;

    let answer: string;

    if (PREFERRED_ENGINE === 'groq') {
      // Convert Gemini-style history to Groq format
      const groqHistory = chatHistory.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts[0]?.text || '',
      }));
      answer = await callWithGroq(systemPrompt, fullUserMessage, groqHistory);
    } else {
      answer = await callWithGemini(systemPrompt, fullUserMessage, chatHistory);
    }

    // Generate follow-up suggestions (simple, no extra API call)
    const suggestedQuestions = [
      'Who is most at risk of burnout?',
      'What should the team focus on today?',
      'Generate an executive summary.',
    ];

    return { answer, suggestedQuestions };
  } catch (error: any) {
    // Try fallback engine if primary fails
    try {
      if (PREFERRED_ENGINE === 'groq' && GEMINI_API_KEY) {
        const data = await getDashboardTelemetry(null);
        const msg = `${buildContextPrompt(data)}\n\n---\n\n${userMessage}`;
        const answer = await callWithGemini(buildSystemPrompt(), msg, []);
        return { answer, suggestedQuestions: [] };
      }
    } catch {}

    console.error('AI error:', error);
    return {
      answer: `❌ **AI Error:** ${error.message || 'Failed to contact AI. Please check your API keys.'}`,
      suggestedQuestions: [],
    };
  }
}

export async function callGeminiForInsight(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY && !GROQ_API_KEY) return '⚠️ No AI API key configured.';

  try {
    const data = await getDashboardTelemetry(null);
    const systemPrompt = buildSystemPrompt();
    const fullPrompt = `${buildContextPrompt(data)}\n\n---\n\n${prompt}`;

    if (PREFERRED_ENGINE === 'groq') {
      return await callWithGroq(systemPrompt, fullPrompt);
    } else {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', systemInstruction: systemPrompt });
      const result = await model.generateContent(fullPrompt);
      return result.response.text();
    }
  } catch (error: any) {
    // Fallback
    try {
      if (PREFERRED_ENGINE === 'groq' && GEMINI_API_KEY) {
        const data = await getDashboardTelemetry(null);
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(`${buildContextPrompt(data)}\n\n---\n\n${prompt}`);
        return result.response.text();
      }
    } catch {}
    return `❌ AI Error: ${error.message}`;
  }
}
