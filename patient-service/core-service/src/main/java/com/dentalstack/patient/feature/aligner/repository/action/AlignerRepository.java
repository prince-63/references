package com.dentalstack.patient.feature.aligner.repository.action;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.projection.AlignerSummary;
import feign.Param;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerRepository extends JpaRepository<Aligner, Long> {

    @Query(
            value =
                    """
    WITH aligner_data AS (
         SELECT DISTINCT ON (p.id)
             p.id AS patientId,
             p.first_name AS firstName,
             p.last_name AS lastName,
             p.mobile_no AS mobileNo,
             p.country_code AS countryCode,
             p.profile_picture_url AS profilePictureUrl,
             aj.id AS alignerJourneyId,
             tp.status AS treatmentStatus,
             aj.progress_status AS progressStatus,
             aj.doctor_treatment_start_date AS treatmentStartDate,
             a.jaw_type AS currentAlignerJawType,
             a.sr_no AS currentAlignerSrNo,
             (SELECT COUNT(*) FROM aligner WHERE aligner_journey_id = aj.id) AS totalAligners,
             aj.brand AS brandName,
             a.start_date AS startDate,
             a.end_date AS endDate,
             a.end_date - CURRENT_DATE AS daysRemaining,
             p.practice_location_name AS practiceLocationName,
             t.pause_date AS treatmentPauseDate,
             p.email AS email,
             t.updated_at AS treatmentCompleteDate,
             aj.start_aligner_no AS startAlignerNo,
             aj.current_aligner_no AS currentAlignerNo,
             aj.recommended_hours_to_wear_aligners AS recommendedHoursToWearAligners,
             aj.doctor_treatment_start_date AS actualStartDate
         FROM\s
             patient p
         LEFT JOIN\s
             (SELECT aj1.*
              FROM aligner_journey aj1
              WHERE aj1.created_at = (SELECT MAX(aj2.created_at)
                                      FROM aligner_journey aj2
                                      WHERE aj2.patient_id = aj1.patient_id)
             ) aj ON p.id = aj.patient_id
         LEFT JOIN\s
             treatment_plan tp ON tp.patient_id = p.id
         LEFT JOIN\s
             tracking t ON tp.id = t.treatment_plan_id
         LEFT JOIN\s
             aligner a ON aj.id = a.aligner_journey_id AND a.sr_no = aj.current_aligner_no
         WHERE\s
             p.added_by_user_id = :doctorId
             AND p.patient_status = 'ACTIVE'
             AND t.is_patient_connected = true
             AND t.tracking_type = 1
         ORDER BY\s
             p.id, aj.doctor_treatment_start_date DESC
     ),
     compliance_calc AS (
         SELECT\s
             ad.*,
             CASE
                 WHEN ad.currentAlignerSrNo = ad.startAlignerNo THEN ad.actualStartDate
                 ELSE ad.startDate
             END AS start_date,
             CASE
                 WHEN CURRENT_DATE <= ad.endDate THEN CURRENT_DATE - INTERVAL '1 day'
                 ELSE ad.endDate
             END AS end_date,
             COALESCE(SUM(dawt.total_wear_time_secs), 0) AS total_wear_time,
             COUNT(DISTINCT dawt.date) AS days_with_data,
             GREATEST(
                 (LEAST(CURRENT_DATE, ad.endDate) - GREATEST(
                     CASE
                         WHEN ad.currentAlignerSrNo = ad.startAlignerNo THEN ad.actualStartDate
                         ELSE ad.startDate
                     END,\s
                     ad.actualStartDate
                 ))::integer,
                 1
             ) AS total_days
         FROM\s
             aligner_data ad
         LEFT JOIN\s
             daily_aligner_wear_time dawt ON dawt.aligner_id = (
                 SELECT id FROM aligner\s
                 WHERE aligner_journey_id = ad.alignerJourneyId AND sr_no = ad.currentAlignerSrNo
             )
             AND dawt.date >= CASE
                 WHEN ad.currentAlignerSrNo = ad.startAlignerNo THEN ad.actualStartDate
                 ELSE ad.startDate
             END
             AND dawt.date <= CASE
                 WHEN CURRENT_DATE <= ad.endDate THEN CURRENT_DATE - INTERVAL '1 day'
                 ELSE ad.endDate
             END
         GROUP BY\s
             ad.alignerJourneyId, ad.patientId, ad.firstName, ad.lastName, ad.mobileNo, ad.countryCode,
             ad.profilePictureUrl, ad.treatmentStatus, ad.progressStatus, ad.treatmentStartDate,
             ad.currentAlignerJawType, ad.currentAlignerSrNo, ad.totalAligners, ad.brandName,
             ad.startDate, ad.endDate, ad.daysRemaining, ad.practiceLocationName, ad.treatmentPauseDate,
             ad.email, ad.treatmentCompleteDate, ad.startAlignerNo, ad.currentAlignerNo,
             ad.recommendedHoursToWearAligners, ad.actualStartDate
     )
     SELECT\s
         cc.*,
         CASE
             WHEN cc.start_date IS NULL THEN NULL
             WHEN cc.start_date > CURRENT_DATE THEN NULL
             WHEN cc.start_date = CURRENT_DATE THEN NULL
             -- Convert (CURRENT_DATE - cc.start_date) from days to an interval for comparison
             WHEN (CURRENT_DATE - cc.start_date) * INTERVAL '1 day' < INTERVAL '25 hours' THEN NULL
             WHEN cc.total_wear_time = 0 THEN 'POOR'
             ELSE
                 CASE
                     WHEN (cc.total_wear_time::float / GREATEST(cc.days_with_data, 1)) / (cc.recommendedHoursToWearAligners * 3600.0) > 0.9 THEN 'GOOD'
                     WHEN (cc.total_wear_time::float / GREATEST(cc.days_with_data, 1)) / (cc.recommendedHoursToWearAligners * 3600.0) > 0.8 THEN 'AVERAGE'
                     ELSE 'POOR'
                 END
         END AS compliance,
         CASE
             WHEN cc.start_date IS NULL THEN NULL
             WHEN cc.start_date > CURRENT_DATE THEN NULL
             WHEN cc.start_date = CURRENT_DATE THEN NULL
             WHEN (CURRENT_DATE - cc.start_date) * INTERVAL '1 day' < INTERVAL '25 hours' THEN NULL
             ELSE (cc.total_wear_time::float / GREATEST(cc.days_with_data, 1)) / (cc.recommendedHoursToWearAligners * 3600.0)
         END AS compliance_ratio,
         cc.days_with_data,
         cc.total_wear_time,
         cc.total_days AS days_since_start
     FROM\s
         compliance_calc cc;
    """,
            nativeQuery = true)
    List<AlignerSummary> findActiveAlignerSummaries(@Param("doctorId") Long doctorId);

    @Query("SELECT a FROM Aligner a " + "WHERE a.startDate <= :currentDate "
            + "AND a.alignerJourney.progressStatus = 'NOT_STARTED'")
    Page<Aligner> findByProductionStatusAndStartDateLessThanEqual(
            @Param("currentDate") LocalDate currentDate, Pageable pageable);
}
