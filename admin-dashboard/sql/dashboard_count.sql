SELECT COUNT(*)
FROM user_profile up
JOIN users u ON u.id = up.user_id
LEFT JOIN plan p ON p.id = up.plan_id
WHERE
    ($1::text IS NULL OR
     u.email ILIKE '%' || $1 || '%' OR
     u.mobile_no ILIKE '%' || $1 || '%' OR
     u.uuid ILIKE '%' || $1 || '%' OR
     u.id::text ILIKE '%' || $1 || '%' OR
     up.organization_brand_name ILIKE '%' || $1 || '%')
    AND ($2::text IS NULL OR LOWER(up.organization_brand_name) = LOWER($2))
    AND ($3::text IS NULL OR p.name = $3);
