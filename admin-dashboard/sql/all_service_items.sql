SELECT
    id,
    item_name,
    is_active,
    display_order
FROM service_items
WHERE is_active = true
ORDER BY display_order;
