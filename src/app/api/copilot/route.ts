import { NextResponse } from 'next/server';
import { handleCopilotQuery } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'A valid query string is required' }, { status: 400 });
    }

    const aiResult = handleCopilotQuery(query);
    return NextResponse.json(aiResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing Copilot request' }, { status: 500 });
  }
}
