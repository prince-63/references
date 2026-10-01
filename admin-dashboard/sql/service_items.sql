WITH profile AS (
    SELECT $1::bigint AS profile_id
),
service_config AS (
    SELECT sc.id
    FROM service_configurations sc
    JOIN profile p ON p.profile_id = sc.profile_id
    LIMIT 1
),
service_items_agg AS (
    SELECT
        COALESCE(
            json_agg(
                json_build_object(
                    'service_item_id', si.id,
                    'item_name', si.item_name,
                    'display_order', si.display_order
                ) ORDER BY si.display_order
            ) FILTER (WHERE si.id IS NOT NULL),
            '[]'::json
        ) AS service_items
    FROM service_config sc
    LEFT JOIN service_config_items sci ON sci.service_config_id = sc.id
    LEFT JOIN service_items si ON si.id = sci.service_item_id
),
service_products_agg AS (
    SELECT
        COALESCE(
            json_agg(
                json_build_object(
                    'id', sp.id,
                    'product_name', sp.product_name,
                    'product_type', sp.product_type,
                    'product_description', sp.product_description,
                    'product_image', sp.product_image,
                    'is_default', sp.is_default,
                    'is_product_enabled', sp.is_product_enabled,
                    'product_category_id', sp.product_category_id,
                    'category_name', pc.name,
                    'category_type', pc.category_type,
                    'product_metadata', sp.product_metadata
                ) ORDER BY sp.id
            ) FILTER (WHERE sp.id IS NOT NULL),
            '[]'::json
        ) AS service_products
    FROM profile p
    LEFT JOIN service_products sp ON sp.profile_id = p.profile_id
    LEFT JOIN product_categories pc ON pc.id = sp.product_category_id
)
SELECT
    sc.id AS service_config_id,
    COALESCE(sia.service_items, '[]'::json) AS service_items,
    COALESCE(spa.service_products, '[]'::json) AS service_products
FROM profile p
LEFT JOIN service_config sc ON true
LEFT JOIN service_items_agg sia ON true
LEFT JOIN service_products_agg spa ON true;
