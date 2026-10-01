import { getPool } from '@/lib/ds';
import { loadSQL } from '@/lib/sql';
import { NextRequest, NextResponse } from 'next/server';
import { resolveEnvironment } from '@/lib/config';
import { logger } from '@/lib/logger';

const usesQuery = loadSQL('subscription_uses_count.sql');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const profileId = searchParams.get('profile_id');
    const environment = resolveEnvironment(searchParams.get('environment'));

    logger.info('Subscription uses GET request', { profileId, environment });

    if (!profileId) {
      logger.warn('Missing profile_id in subscription uses request');
      return NextResponse.json(
        { error: 'Unable to process your request. Please try again.' },
        { status: 400 }
      );
    }

    const pool = getPool(environment);
    const result = await pool.query(usesQuery, [parseInt(profileId, 10)]);

    if (result.rows.length === 0) {
      logger.debug('No usage data found for profile', { profileId });
      return NextResponse.json({
        patients_used: 0,
        orders_used: 0,
        users_used: 0,
        storage_used_mb: 0,
      });
    }

    logger.debug('Subscription uses fetched successfully', {
      profileId,
      data: result.rows[0],
    });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    logger.error('Subscription uses API GET error', { error });
    return NextResponse.json(
      { error: 'Unable to load subscription details. Please try again.' },
      { status: 500 }
    );
  }
}
