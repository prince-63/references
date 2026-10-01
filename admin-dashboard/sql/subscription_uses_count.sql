WITH org AS (
    SELECT organization_id
    FROM user_profile
    WHERE id = $1
)

SELECT
    (
        SELECT COUNT(*)
        FROM patient_doctor_organization pdo
        WHERE pdo.organization_id = (SELECT organization_id FROM org)
    ) AS patients_used,

    (
        SELECT COUNT(*)
        FROM orders o
        WHERE o.organization_id = (SELECT organization_id FROM org)
    ) AS orders_used,

    (
        SELECT COUNT(*)
        FROM doctor_invitation d
        WHERE d.organization_id = (SELECT organization_id FROM org)
    ) AS users_used,
    
    ROUND((
        SELECT COALESCE(SUM(f.size), 0)
        FROM file f
        WHERE f.organization_id = (SELECT organization_id FROM org)
          AND f.status = 'ACTIVE'
    ) / (1024.0 * 1024.0), 2) AS storage_used_mb;
