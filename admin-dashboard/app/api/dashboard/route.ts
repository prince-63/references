import { getPool } from '@/lib/ds';
import { loadSQL } from '@/lib/sql';
import { NextRequest, NextResponse } from 'next/server';
import type {
  DashboardResponse,
  UpdatePayload,
  DashboardSortField,
  SortOrder,
} from '@/lib/types';
import { resolveEnvironment } from '@/lib/config';
import type { Environment } from '@/lib/config';
import { logger } from '@/lib/logger';

const dataQueryTemplate = loadSQL('dashboard.sql');
const countQuery = loadSQL('dashboard_count.sql');

const SORT_FIELD_SQL: Record<DashboardSortField, string> = {
  profile_id: 'fp.profile_id',
  display_name: "LOWER(COALESCE(fp.display_name, ''))",
  email: "LOWER(COALESCE(fp.email, ''))",
  mobile_no: "LOWER(COALESCE(fp.mobile_no, ''))",
  profile_type: "LOWER(COALESCE(fp.profile_type, ''))",
  is_demo_completed: 'COALESCE(fp.is_demo_completed, false)',
  isgdrive_platform_enabled: 'COALESCE(fp.isgdrive_platform_enabled, false)',
  is_whats_app_messaging_enabled:
    'COALESCE(fp.is_whats_app_messaging_enabled, false)',
  current_term_start: 'fp.current_term_start',
  next_billing_at: 'fp.next_billing_at',
};

function getSortField(value: string | null): DashboardSortField {
  if (!value) return 'profile_id';
  return value in SORT_FIELD_SQL ? (value as DashboardSortField) : 'profile_id';
}

function getSortOrder(value: string | null): SortOrder {
  return value === 'asc' ? 'asc' : 'desc';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || null;
    const organization = searchParams.get('organization') || null;
    const planName = searchParams.get('planName') || null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const environment = resolveEnvironment(searchParams.get('environment'));
    const sortBy = getSortField(searchParams.get('sortBy'));
    const sortOrder = getSortOrder(searchParams.get('sortOrder'));
    const offset = (page - 1) * pageSize;
    const sortSql = SORT_FIELD_SQL[sortBy];
    const direction = sortOrder.toUpperCase();
    const dataQuery = dataQueryTemplate.replace(
      '__ORDER_BY__',
      `${sortSql} ${direction} NULLS LAST, fp.profile_id DESC`
    );

    logger.info('Dashboard GET request', {
      environment,
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    });

    const pool = getPool(environment);

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [search, organization, planName, pageSize, offset]),
      pool.query(countQuery, [search, organization, planName]),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / pageSize);

    logger.info('Dashboard data fetched successfully', {
      total,
      page,
      totalPages,
      environment,
    });

    const response: DashboardResponse = {
      data: dataResult.rows,
      total,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Dashboard API GET error', { error });
    return NextResponse.json(
      { error: 'Unable to load the dashboard. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body: UpdatePayload & { environment?: Environment } =
      await request.json();
    const {
      profile_id,
      subscription_id,
      updates,
      environment: requestedEnvironment,
    } = body;
    const environment = resolveEnvironment(requestedEnvironment);

    logger.info('Dashboard PATCH request', {
      profile_id,
      subscription_id,
      updateFields: Object.keys(updates),
      environment,
    });

    const pool = getPool(environment);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      if (
        updates.is_tracking_enabled !== undefined ||
        updates.is_stl_file_view_enabled !== undefined
      ) {
        const profileUpdates: string[] = [];
        const profileValues: (string | number | boolean)[] = [];
        let paramIndex = 1;

        if (updates.is_tracking_enabled !== undefined) {
          profileUpdates.push(`is_tracking_enabled = $${paramIndex++}`);
          profileValues.push(updates.is_tracking_enabled);
        }
        if (updates.is_stl_file_view_enabled !== undefined) {
          profileUpdates.push(`is_stl_file_view_enabled = $${paramIndex++}`);
          profileValues.push(updates.is_stl_file_view_enabled);
        }

        if (profileUpdates.length > 0) {
          profileValues.push(profile_id);
          await client.query(
            `UPDATE user_profile SET ${profileUpdates.join(', ')} WHERE id = $${paramIndex}`,
            profileValues
          );
        }
      }

      if (subscription_id && updates.is_plan_upgraded !== undefined) {
        await client.query(
          `UPDATE subscription_user_mapping SET is_plan_upgraded = $1 WHERE subscription_plan_id = $2 AND user_profile_id = $3`,
          [updates.is_plan_upgraded, subscription_id, profile_id]
        );
      }

      if (subscription_id && updates) {
        const directFields = [
          'is_demo_completed',
          'isgdrive_platform_enabled',
          'is_whats_app_messaging_enabled',
          'total_patients',
          'total_orders',
          'total_storage_gb',
          'total_users',
          'requested_for_deactivation',
          'g_drive_migration_status',
          'isgdrive_platform_authenticated',
        ];

        const subscriptionUpdates: string[] = [];
        const subscriptionValues: (string | number | boolean)[] = [];
        let paramIndex = 1;

        for (const field of directFields) {
          const fieldValue = updates[field as keyof typeof updates];
          if (fieldValue !== undefined && typeof fieldValue !== 'object') {
            subscriptionUpdates.push(`${field} = $${paramIndex++}`);
            subscriptionValues.push(fieldValue as string | number | boolean);
          }
        }

        const metadataFields = [
          'next_billing_at',
          'current_term_end',
          'current_term_start',
          'plan_status',
          'plan_name',
          'plan_type',
          'is_trial_plan',
        ];
        const hasMetadataUpdates = metadataFields.some(
          (field) => updates[field as keyof typeof updates] !== undefined
        );

        if (hasMetadataUpdates) {
          let metadataUpdate = 'plan_metadata';

          if (updates.next_billing_at !== undefined) {
            const timestamp =
              new Date(updates.next_billing_at).getTime() / 1000;
            metadataUpdate = `jsonb_set(${metadataUpdate}, '{nextBillingAt}', to_jsonb($${paramIndex++}::numeric))`;
            subscriptionValues.push(timestamp);
          }

          if (updates.current_term_end !== undefined) {
            const timestamp =
              new Date(updates.current_term_end).getTime() / 1000;
            metadataUpdate = `jsonb_set(${metadataUpdate}, '{currentTermEnd}', to_jsonb($${paramIndex++}::numeric))`;
            subscriptionValues.push(timestamp);
          }

          if (updates.current_term_start !== undefined) {
            const timestamp =
              new Date(updates.current_term_start).getTime() / 1000;
            metadataUpdate = `jsonb_set(${metadataUpdate}, '{currentTermStart}', to_jsonb($${paramIndex++}::numeric))`;
            subscriptionValues.push(timestamp);
          }

          if (updates.plan_status !== undefined) {
            metadataUpdate = `jsonb_set(${metadataUpdate}, '{status}', to_jsonb($${paramIndex++}::text))`;
            subscriptionValues.push(updates.plan_status);
          }

          if (updates.plan_name !== undefined) {
            metadataUpdate = `jsonb_set(${metadataUpdate}, '{planName}', to_jsonb($${paramIndex++}::text))`;
            subscriptionValues.push(updates.plan_name);
          }

          if (updates.plan_type !== undefined) {
            metadataUpdate = `jsonb_set(${metadataUpdate}, '{planType}', to_jsonb($${paramIndex++}::text))`;
            subscriptionValues.push(updates.plan_type);
          }

          if (updates.is_trial_plan !== undefined) {
            metadataUpdate = `jsonb_set(${metadataUpdate}, '{trialPlan}', to_jsonb($${paramIndex++}::boolean))`;
            subscriptionValues.push(updates.is_trial_plan);
          }

          subscriptionUpdates.push(`plan_metadata = ${metadataUpdate}`);
        }

        if (subscriptionUpdates.length > 0) {
          subscriptionValues.push(subscription_id);
          await client.query(
            `UPDATE subscription SET ${subscriptionUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
            subscriptionValues
          );
        }
      }

      if (updates.plan_name !== undefined) {
        const mappedPlanName: Record<string, string> = {
          STARTER: 'STARTER_PLAN',
          LITE: 'LITE_PLAN',
          GROWTH: 'GROWTH_PLAN',
        };
        const targetPlanName =
          mappedPlanName[updates.plan_name] ?? updates.plan_name;

        const planResult = await client.query<{ id: number }>(
          'SELECT id FROM plan WHERE name = $1 LIMIT 1',
          [targetPlanName]
        );

        if (planResult.rowCount === 0) {
          throw new Error(`Plan not found: ${targetPlanName}`);
        }

        await client.query(
          `UPDATE user_profile SET plan_id = $2 WHERE id = $1`,
          [profile_id, planResult.rows[0].id]
        );
      }

      await client.query('COMMIT');
      logger.info('Dashboard updates committed successfully', {
        profile_id,
        subscription_id,
      });
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Dashboard update transaction failed, rolled back', {
        error,
        profile_id,
      });
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Dashboard API PATCH error', { error });
    return NextResponse.json(
      { error: 'Unable to save your changes. Please try again.' },
      { status: 500 }
    );
  }
}
