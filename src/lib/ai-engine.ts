import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDashboardTelemetry } from './db';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

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

export async function callGeminiAI(
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<{ answer: string; suggestedQuestions: string[] }> {
  if (!GEMINI_API_KEY) {
    return {
      answer: '⚠️ **Gemini API Key not configured.** Please add `GEMINI_API_KEY` to your environment variables.',
      suggestedQuestions: [],
    };
  }

  try {
    // Fetch live dashboard data
    const data = await getDashboardTelemetry(null);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: buildSystemPrompt(),
    });

    const contextPrefix = buildContextPrompt(data);
    
    // For new chats, prepend context to first user message
    const history = chatHistory.length > 0 ? chatHistory : [];

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Send context + user message together on first turn, just user message after
    const messageToSend = chatHistory.length === 0
      ? `${contextPrefix}\n\n---\n\n## User Question\n${userMessage}`
      : userMessage;

    const result = await chat.sendMessage(messageToSend);
    const answer = result.response.text();

    // Generate follow-up question suggestions
    const suggestResult = await model.generateContent(
      `Based on this sprint context and the answer just given, suggest 3 short follow-up questions a scrum master might ask. Return ONLY a JSON array of 3 strings, nothing else.\n\nAnswer was about: ${userMessage}`
    );
    
    let suggestedQuestions: string[] = [];
    try {
      const raw = suggestResult.response.text().replace(/```json|```/g, '').trim();
      suggestedQuestions = JSON.parse(raw);
    } catch {
      suggestedQuestions = [
        'Who is most at risk of burnout?',
        'What should we do today to improve sprint health?',
        'Generate an executive summary.',
      ];
    }

    return { answer, suggestedQuestions };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return {
      answer: `❌ **AI Error:** ${error.message || 'Failed to contact Gemini AI. Please check your API key.'}`,
      suggestedQuestions: [],
    };
  }
}

export async function callGeminiForInsight(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) return '⚠️ API Key not configured.';
  
  try {
    const data = await getDashboardTelemetry(null);
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: buildSystemPrompt(),
    });

    const result = await model.generateContent(
      `${buildContextPrompt(data)}\n\n---\n\n${prompt}`
    );
    return result.response.text();
  } catch (error: any) {
    return `❌ Error: ${error.message}`;
  }
}
