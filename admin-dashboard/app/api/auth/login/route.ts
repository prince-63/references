import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    logger.info('Login attempt', { username });

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      logger.info('Login successful', { username });
      return NextResponse.json({ success: true });
    }

    logger.warn('Login failed - invalid credentials', { username });
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid username or password. Please try again.',
      },
      { status: 401 }
    );
  } catch (error) {
    logger.error('Authentication error', { error });
    return NextResponse.json(
      { success: false, error: 'Unable to complete login. Please try again.' },
      { status: 500 }
    );
  }
}
