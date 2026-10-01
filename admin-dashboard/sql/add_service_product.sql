WITH product_category_id AS (
    SELECT pc.id
    FROM product_categories pc
    WHERE pc.name = $2
)

INSERT INTO service_products (
    created_at,
    updated_at,
    version,
    is_default,
    product_description,
    product_image,
    product_metadata,
    product_name,
    product_type,
    product_category_id,
    profile_id,
    is_product_enabled
)
SELECT
    NOW(),
    NOW(),
    0,
    TRUE,
    $3,  -- product_description
    $4,  -- product_image
    NULL,
    $5,  -- product_name
    $6,  -- product_type
    product_category_id.id,
    $1,  -- profile_id
    TRUE
FROM product_category_id
WHERE EXISTS (SELECT 1 FROM product_category_id)
RETURNING id;
