import { NextResponse } from 'next/server';
import { patchIssue } from '@/lib/db';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, isBlocked, blockedReason, assigneeId } = body;

    if (!id) {
      return NextResponse.json({ error: 'Issue identifier is required' }, { status: 400 });
    }

    const updatedIssue = await patchIssue(id, { status, isBlocked, blockedReason, assigneeId });

    if (!updatedIssue) {
      return NextResponse.json({ error: 'Issue not found in database' }, { status: 404 });
    }

    return NextResponse.json(updatedIssue);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update issue' }, { status: 500 });
  }
}
