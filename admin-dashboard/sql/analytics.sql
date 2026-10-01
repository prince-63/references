SELECT
  (SELECT COUNT(*) FROM patient_doctor_organization 
   WHERE organization_id = $1 
   AND created_at >= NOW() - INTERVAL '30 days') as patient_count,
  (SELECT COUNT(*) FROM orders 
   WHERE organization_id = $1 
   AND created_at >= NOW() - INTERVAL '30 days') as order_count;
