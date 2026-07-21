import { NextResponse } from 'next/server';
import { authenticateUser, registerUser } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, username, password, name } = body;

    if (action === 'register') {
      const result = await registerUser(username, password, name);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(result);
    } else {
      // Login by default
      const result = await authenticateUser(username, password);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 401 });
      }
      return NextResponse.json(result);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication error' }, { status: 500 });
  }
}
