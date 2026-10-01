import { getPool } from '@/lib/ds';
import { loadSQL } from '@/lib/sql';
import { NextRequest, NextResponse } from 'next/server';
import { resolveEnvironment } from '@/lib/config';
import { logger } from '@/lib/logger';

const analyticsQuery = loadSQL('analytics.sql');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organization_id');
    const environment = resolveEnvironment(searchParams.get('environment'));

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organization_id is required' },
        { status: 400 }
      );
    }

    logger.info('Analytics GET request', {
      organizationId,
      environment,
    });

    const pool = getPool(environment);
    const result = await pool.query(analyticsQuery, [organizationId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          patient_count: 0,
          order_count: 0,
        },
        { status: 200 }
      );
    }

    logger.info('Analytics data fetched successfully', {
      organizationId,
      patientCount: result.rows[0].patient_count,
      orderCount: result.rows[0].order_count,
      environment,
    });

    return NextResponse.json(
      {
        patient_count: parseInt(result.rows[0].patient_count, 10),
        order_count: parseInt(result.rows[0].order_count, 10),
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to fetch analytics data', { error: message });
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
