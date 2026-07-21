import { NextResponse } from 'next/server';
import { callGeminiForInsight } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, type } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'A prompt is required' }, { status: 400 });
    }

    const result = await callGeminiForInsight(prompt);
    return NextResponse.json({ result, type });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error generating AI insight' }, { status: 500 });
  }
}
