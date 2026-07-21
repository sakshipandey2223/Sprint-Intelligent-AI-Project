import { NextResponse } from 'next/server';
import { getDashboardTelemetry } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sprintIdParam = searchParams.get('sprintId');
    
    let sprintId: number | null = 10; // Default to active sprint 10
    if (sprintIdParam) {
      if (sprintIdParam === 'null') {
        sprintId = null;
      } else {
        sprintId = parseInt(sprintIdParam, 10);
      }
    }

    const data = await getDashboardTelemetry(sprintId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
