import { NextResponse } from 'next/server';
import { callGeminiAI } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, history = [] } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'A valid query string is required' }, { status: 400 });
    }

    const aiResult = await callGeminiAI(query, history);
    return NextResponse.json(aiResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing Copilot request' }, { status: 500 });
  }
}
