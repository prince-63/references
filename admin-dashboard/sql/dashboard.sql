WITH filtered_profiles AS (
    SELECT
        up.id AS profile_id,
        u.display_name,
        u.email,
        u.mobile_no,
        up.organization_brand_name,
        up.profile_type,
        p.name AS plan_name,
        s.plan_metadata ->> 'status' AS plan_status,
        s.is_demo_completed,
        s.isgdrive_platform_enabled,
        s.is_whats_app_messaging_enabled,
        to_timestamp((s.plan_metadata ->> 'currentTermStart')::double precision) AS current_term_start,
        to_timestamp((s.plan_metadata ->> 'nextBillingAt')::double precision) AS next_billing_at
    FROM user_profile up
    JOIN users u ON u.id = up.user_id
    LEFT JOIN subscription_user_mapping sumap ON sumap.user_profile_id = up.id
    LEFT JOIN subscription s ON s.id = sumap.subscription_plan_id
    LEFT JOIN plan p ON p.id = up.plan_id
    WHERE
        ($1::text IS NULL OR
         u.email ILIKE '%' || $1 || '%' OR
         u.mobile_no ILIKE '%' || $1 || '%' OR
         u.uuid ILIKE '%' || $1 || '%' OR
         u.id::text ILIKE '%' || $1 || '%' OR
         up.organization_brand_name ILIKE '%' || $1 || '%')
        AND ($2::text IS NULL OR LOWER(up.organization_brand_name) = LOWER($2))
        AND ($3::text IS NULL OR p.name = $3)
),
base_profiles AS (
    SELECT fp.profile_id AS id
    FROM filtered_profiles fp
    ORDER BY __ORDER_BY__
    LIMIT $4 OFFSET $5
),
base_organizations AS (
    SELECT DISTINCT up.organization_id
    FROM base_profiles bp
    JOIN user_profile up ON up.id = bp.id
    WHERE up.organization_id IS NOT NULL
),
organization_usage AS (
    SELECT
        bo.organization_id,
        COALESCE(pdo.patients_used, 0) AS patients_used,
        COALESCE(o.orders_used, 0) AS orders_used,
        COALESCE(di.users_used, 0) AS users_used,
        COALESCE(fs.storage_used_mb, 0)::numeric(12,2) AS storage_used_mb
    FROM base_organizations bo
    LEFT JOIN (
        SELECT organization_id, COUNT(*)::int AS patients_used
        FROM patient_doctor_organization
        GROUP BY organization_id
    ) pdo ON pdo.organization_id = bo.organization_id
    LEFT JOIN (
        SELECT organization_id, COUNT(*)::int AS orders_used
        FROM orders
        GROUP BY organization_id
    ) o ON o.organization_id = bo.organization_id
    LEFT JOIN (
        SELECT organization_id, COUNT(*)::int AS users_used
        FROM doctor_invitation
        GROUP BY organization_id
    ) di ON di.organization_id = bo.organization_id
    LEFT JOIN (
        SELECT organization_id, ROUND(COALESCE(SUM(size), 0) / (1024.0 * 1024.0), 2) AS storage_used_mb
        FROM file
        WHERE status = 'ACTIVE'
        GROUP BY organization_id
    ) fs ON fs.organization_id = bo.organization_id
)

SELECT
    u.id AS user_id,
    u.display_name,
    u.email,
    u.mobile_no,
    u.status AS user_status,

    up.id AS profile_id,
    up.organization_id,
    up.profile_type,
    up.status AS profile_status,
    up.organization_brand_name,
    up.is_tracking_enabled,
    up.is_stl_file_view_enabled,

    sumap.is_admin,
    sumap.is_plan_upgraded,

    s.id AS subscription_id,
    s.total_patients,
    s.total_orders,
    s.total_storage_gb,
    s.total_users,
    s.is_demo_completed,
    s.isgdrive_platform_enabled,
    s.is_whats_app_messaging_enabled,

    s.plan_metadata ->> 'status' AS plan_status,
    p.name AS plan_name,
    s.plan_metadata ->> 'planType' AS plan_type,
    (s.plan_metadata ->> 'trialPlan')::boolean AS is_trial_plan,

    ou.patients_used,
    ou.orders_used,
    ou.users_used,
    ou.storage_used_mb,

    to_timestamp((s.plan_metadata ->> 'currentTermStart')::double precision) AS current_term_start,
    to_timestamp((s.plan_metadata ->> 'nextBillingAt')::double precision) AS next_billing_at,
    to_timestamp((s.plan_metadata ->> 'currentTermEnd')::double precision) AS current_term_end,

    sc.id AS service_config_id,
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

FROM base_profiles bp
JOIN user_profile up ON up.id = bp.id
JOIN users u ON u.id = up.user_id
LEFT JOIN subscription_user_mapping sumap ON sumap.user_profile_id = up.id
LEFT JOIN subscription s ON s.id = sumap.subscription_plan_id
LEFT JOIN plan p ON p.id = up.plan_id
LEFT JOIN service_configurations sc ON sc.profile_id = up.id
LEFT JOIN service_config_items sci ON sci.service_config_id = sc.id
LEFT JOIN service_items si ON si.id = sci.service_item_id
LEFT JOIN organization_usage ou ON ou.organization_id = up.organization_id
GROUP BY u.id, up.id, sumap.is_admin, sumap.is_plan_upgraded, s.id, sc.id, p.name, ou.patients_used, ou.orders_used, ou.users_used, ou.storage_used_mb;
