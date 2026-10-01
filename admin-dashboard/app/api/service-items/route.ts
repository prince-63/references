import { getPool } from '@/lib/ds';
import { loadSQL } from '@/lib/sql';
import { NextRequest, NextResponse } from 'next/server';
import { resolveEnvironment } from '@/lib/config';
import { logger } from '@/lib/logger';

const allServiceItemsQuery = loadSQL('all_service_items.sql');
const profileServiceItemsQuery = loadSQL('service_items.sql');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const environment = resolveEnvironment(searchParams.get('environment'));
    const profileId = searchParams.get('profile_id');

    logger.info('Service items GET request', { environment, profileId });

    const pool = getPool(environment);
    if (profileId) {
      const parsedProfileId = parseInt(profileId, 10);
      if (Number.isNaN(parsedProfileId)) {
        logger.warn('Invalid profile_id parameter', { profileId });
        return NextResponse.json(
          { error: 'Unable to process your request. Please try again.' },
          { status: 400 }
        );
      }

      const [allItemsResult, profileResult] = await Promise.all([
        pool.query(allServiceItemsQuery),
        pool.query(profileServiceItemsQuery, [parsedProfileId]),
      ]);

      const profileData = profileResult.rows[0] || {
        service_config_id: null,
        service_items: [],
        service_products: [],
      };

      logger.debug('Service items and products fetched', {
        profileId,
        itemCount: allItemsResult.rows.length,
        productCount: profileData.service_products?.length || 0,
      });
      return NextResponse.json({
        data: allItemsResult.rows,
        profile: profileData,
      });
    }

    const result = await pool.query(allServiceItemsQuery);
    logger.debug('All service items fetched', {
      itemCount: result.rows.length,
    });

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    logger.error('Service items API GET error', { error });
    return NextResponse.json(
      { error: 'Unable to load service items. Please try again.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profile_id,
      service_item_ids,
      environment: requestedEnvironment,
    } = body;
    const environment = resolveEnvironment(requestedEnvironment);

    logger.info('Service items PATCH request', {
      profile_id,
      itemCount: service_item_ids?.length || 0,
      environment,
    });

    const pool = getPool(environment);
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      let serviceConfigId: number;

      const configResult = await client.query(
        'SELECT id FROM service_configurations WHERE profile_id = $1',
        [profile_id]
      );

      if (configResult.rows.length > 0) {
        serviceConfigId = configResult.rows[0].id;
        logger.debug('Using existing service config', {
          serviceConfigId,
          profile_id,
        });
        await client.query(
          'DELETE FROM service_config_items WHERE service_config_id = $1',
          [serviceConfigId]
        );
      } else {
        const insertResult = await client.query(
          'INSERT INTO service_configurations (profile_id) VALUES ($1) RETURNING id',
          [profile_id]
        );
        serviceConfigId = insertResult.rows[0].id;
        logger.debug('Created new service config', {
          serviceConfigId,
          profile_id,
        });
      }

      if (service_item_ids && service_item_ids.length > 0) {
        for (let i = 0; i < service_item_ids.length; i++) {
          await client.query(
            'INSERT INTO service_config_items (service_config_id, service_item_id) VALUES ($1, $2)',
            [serviceConfigId, service_item_ids[i]]
          );
        }
        logger.info('Service items updated successfully', {
          profile_id,
          itemCount: service_item_ids.length,
        });
      }

      await client.query('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Service items update transaction failed, rolled back', {
        error,
        profile_id,
      });
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error('Service items API PATCH error', { error });
    return NextResponse.json(
      { error: 'Unable to save your service selections. Please try again.' },
      { status: 500 }
    );
  }
}
