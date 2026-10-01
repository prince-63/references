import { getPool } from '@/lib/ds';
import { NextRequest, NextResponse } from 'next/server';
import { resolveEnvironment } from '@/lib/config';
import { loadSQL } from '@/lib/sql';
import { logger } from '@/lib/logger';

const addProductQuery = loadSQL('add_service_product.sql');

// Predefined product templates
const PREDEFINED_PRODUCTS = {
  PLANNING: {
    categoryName: 'PLANNING',
    description: 'Expert Aligner Planning Services',
    image:
      'https://prod-patient-gallery-ds.s3.ap-south-1.amazonaws.com/product/1176/profile_picture/planning.jpg',
    name: 'Expert Aligner Planning',
    type: 'SERVICE',
  },
  MANUFACTURING: {
    categoryName: 'ALIGNERS(MANUFACTURING)',
    description: 'Premium High Quality Aligners',
    image:
      'https://prod-patient-gallery-ds.s3.ap-south-1.amazonaws.com/product/1176/profile_picture/manufacturing.png',
    name: 'White Labelled Aligners',
    type: 'MANUFACTURING_SERVICE',
  },
  PLANNING_MANUFACTURING: {
    categoryName: 'ALIGNERS(PLANNING + MANUFACTURING)',
    description: 'Premium high quality Aligners',
    image:
      'https://prod-patient-gallery-ds.s3.ap-south-1.amazonaws.com/product/1232/profile_picture/image.png',
    name: 'Aligners',
    type: 'ALIGNER',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      profile_id,
      product_template,
      environment: requestedEnvironment,
    } = body;
    const environment = resolveEnvironment(requestedEnvironment);

    logger.info('Service product POST request', {
      profile_id,
      product_template,
      environment,
    });

    if (!profile_id) {
      logger.warn('Missing profile_id in service product request');
      return NextResponse.json(
        { error: 'Unable to process your request. Please try again.' },
        { status: 400 }
      );
    }

    if (
      !product_template ||
      !PREDEFINED_PRODUCTS[product_template as keyof typeof PREDEFINED_PRODUCTS]
    ) {
      logger.warn('Invalid product_template', { product_template });
      return NextResponse.json(
        {
          error:
            'The selected product is not available. Please choose another.',
        },
        { status: 400 }
      );
    }

    const template =
      PREDEFINED_PRODUCTS[product_template as keyof typeof PREDEFINED_PRODUCTS];
    const pool = getPool(environment);

    const result = await pool.query(addProductQuery, [
      profile_id,
      template.categoryName,
      template.description,
      template.image,
      template.name,
      template.type,
    ]);

    if (result.rows.length === 0) {
      logger.error('Product insert failed', { profile_id, product_template });
      return NextResponse.json(
        { error: 'Unable to add the product. Please try again.' },
        { status: 400 }
      );
    }

    logger.info('Service product added successfully', {
      profile_id,
      product_id: result.rows[0].id,
      product_template,
    });
    return NextResponse.json({ success: true, product_id: result.rows[0].id });
  } catch (error) {
    logger.error('Service products POST error', { error });
    return NextResponse.json(
      { error: 'Unable to add the product. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, profile_id, environment: requestedEnvironment } = body;
    const environment = resolveEnvironment(requestedEnvironment);

    logger.info('Service product DELETE request', {
      product_id,
      profile_id,
      environment,
    });

    if (!product_id || !profile_id) {
      logger.warn('Missing product_id or profile_id in delete request');
      return NextResponse.json(
        { error: 'Unable to process your request. Please try again.' },
        { status: 400 }
      );
    }

    const pool = getPool(environment);

    const result = await pool.query(
      'DELETE FROM service_products WHERE id = $1 AND profile_id = $2',
      [product_id, profile_id]
    );

    if (result.rowCount === 0) {
      logger.warn('Product not found or unauthorized delete attempt', {
        product_id,
        profile_id,
      });
      return NextResponse.json(
        {
          error: 'The product could not be found or removed. Please try again.',
        },
        { status: 404 }
      );
    }

    logger.info('Service product deleted successfully', {
      product_id,
      profile_id,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Service products DELETE error', { error });
    return NextResponse.json(
      { error: 'Unable to remove the product. Please try again.' },
      { status: 500 }
    );
  }
}
