package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.projection.BracesJourneySummary;
import com.dentalstack.patient.feature.invitation.projection.WebLeadDetailsSummary;
import com.dentalstack.patient.feature.patient.projection.ActivePatientSummary;
import com.dentalstack.patient.feature.patient.projection.CombinedPatientSummary;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanPatientSummary;
import feign.Param;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientListRepository extends JpaRepository<AlignerJourney, Long> {

    @Query(
            nativeQuery = true,
            value =
                    """
                        SELECT DISTINCT ON(p.id)
                            aj.id AS alignerJourneyId,
                            aj.patient_id AS patientId,
                            tp.brand_name AS brandName,
                            tp.status AS trackingStatus,
                            aj.treatment_type AS treatmentType,
                            pdo.doctor_id AS doctorId,
                            aj.doctor_treatment_start_date AS doctorTreatmentStartDate,
                            p.email AS email,
                            p.mobile_no AS mobile,
                            p.country_code AS countryCode,
                            p.profile_picture_url AS profilePictureUrl,
                            CASE
                                WHEN p.last_name IS NULL THEN p.first_name
                                ELSE CONCAT(p.first_name, ' ', p.last_name)
                            END AS fullName,
                            p.last_name AS lastName,
                            p.customer_mapped_id AS customPatientId,
                            array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
                            p.practice_location_name AS practiceLocationName,
                            p.practice_location_id AS practiceLocationId,
                            p.created_at AS addedOn,
                            i.status AS invitationStatus,
                            i.is_invitation_sent AS isInvitationSent,
                            pdo.patient_belongs_to AS patientBelongsTo,
                            p.updated_at AS updatedAt,
                            tp.id AS treatmentPlanId,
                            aj.id AS alignerJourneyId
                        FROM aligner_journey aj
                        JOIN patient p ON aj.patient_id = p.id
                        LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
                        LEFT JOIN invitation i ON pid.invitation_id = i.id
                        JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
                        LEFT JOIN tracking t ON aj.id = t.aligner_journey_id
                        LEFT JOIN treatment_plan tp ON tp.id = t.treatment_plan_id
                        WHERE aj.patient_id IN (:patientIds)
                            AND aj.creation_status = 'DONE'
                            AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'DEACTIVATED')
                            AND aj.id = (
                                SELECT MAX(aj2.id)
                                FROM aligner_journey aj2
                                WHERE aj2.patient_id = aj.patient_id
                                    AND aj2.creation_status = 'DONE'
                                    AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'DEACTIVATED')
                            )
                        ORDER BY p.id, p.updated_at DESC;

""")
    List<ActivePatientSummary> findDetailedAlignerJourneySummariesByPatientIds(
            @Param("patientIds") Set<Long> patientIds);

    @Query(
            """
    SELECT
        bj.patient.id AS patientId,
        bj.bracesTreatmentStage AS bracesTreatmentStage,
        bj.createdAt AS doctorTreatmentStartDate,
        p.email AS email,
        p.mobileNo AS mobile,
        p.countryCode AS countryCode,
        CASE
            WHEN p.lastName IS NULL THEN p.firstName
            ELSE CONCAT(p.firstName, ' ', p.lastName)
        END AS fullName,
        p.lastName AS lastName,
        p.customerMappedId AS customPatientId,
        p.practiceLocationName AS practiceLocationName,
        p.practiceLocationId AS practiceLocationId,
        p.createdAt AS addedOn,
        i.status AS invitationStatus,
        i.isInvitationSent AS isInvitationSent
    FROM BracesJourney bj
    JOIN bj.patient p
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = p.id
    LEFT JOIN pid.invitation i
    WHERE bj.patient.id IN :patientIds
        AND bj.id = (
            SELECT MAX(bj2.id)
            FROM BracesJourney bj2
            WHERE bj2.patient.id = bj.patient.id
                AND EXISTS (SELECT 1 FROM bj2.appointments a WHERE a.bracesJourney.id = bj2.id)
        )
        AND EXISTS (SELECT 1 FROM bj.appointments a WHERE a.bracesJourney.id = bj.id)
    ORDER BY bj.patient.id, bj.id DESC
""")
    List<BracesJourneySummary> findBracesJourneySummariesByPatientIds(@Param("patientIds") Set<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
SELECT DISTINCT ON(p.id)
    COALESCE(aj.patient_id, bj.patient_id) AS patientId,
    tp.brand_name AS brandName,
    tp.status AS trackingStatus,
    pdo.doctor_id AS doctorId,
    COALESCE(aj.doctor_treatment_start_date, bj.created_at) AS doctorTreatmentStartDate,
    p.email,
    p.mobile_no AS mobile,
    p.country_code AS countryCode,
    CASE
        WHEN p.last_name IS NULL THEN p.first_name
        ELSE CONCAT(p.first_name, ' ', p.last_name)
    END AS fullName,
    p.customer_mapped_id AS customPatientId,
    p.practice_location_name AS practiceLocationName,
    p.practice_location_id AS practiceLocationId,
    p.created_at AS addedOn,
    array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
    p.profile_picture_url AS profilePictureUrl,
    pdo.patient_belongs_to AS patientBelongsTo,
    p.updated_at AS updatedAt,
    aj.treatment_type AS treatmentType,
    i.status AS invitationStatus,
    i.is_invitation_sent AS isInvitationSent,
    tp.id AS treatmentPlanId,
    aj.id AS alignerJourneyId
FROM patient p
LEFT JOIN aligner_journey aj ON aj.patient_id = p.id
    AND aj.creation_status = 'DONE'
    AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'DEACTIVATED')
    AND aj.id = (
        SELECT MAX(aj2.id)
        FROM aligner_journey aj2
        WHERE aj2.patient_id = p.id
        AND aj2.creation_status = 'DONE'
        AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'DEACTIVATED')
    )
LEFT JOIN braces_journey bj ON bj.patient_id = p.id
    AND bj.id = (
        SELECT MAX(bj2.id)
        FROM braces_journey bj2
        INNER JOIN appointment a2 ON a2.braces_journey_id = bj2.id
        WHERE bj2.patient_id = p.id
        GROUP BY bj2.id
    )
    AND EXISTS (SELECT 1 FROM appointment a WHERE a.braces_journey_id = bj.id)
LEFT JOIN tracking t ON aj.id = t.aligner_journey_id
LEFT JOIN treatment_plan tp ON tp.id = t.treatment_plan_id
LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
LEFT JOIN invitation i ON pid.invitation_id = i.id
LEFT JOIN patient_doctor_organization pdo ON pdo.patient_id = p.id
WHERE
    p.id IN (:patientIds)
    AND (aj.id IS NOT NULL OR bj.id IS NOT NULL)
    AND (
        :search IS NULL
        OR :search = ''
        OR (
            LOWER(COALESCE(p.email, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(p.mobile_no, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(p.customer_mapped_id, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            OR (
                LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 1), '%'))
                AND LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 2), '%'))
            )
        )
    )
ORDER BY p.id, p.updated_at DESC;
""")
    List<ActivePatientSummary> findDetailedPatientSummariesWithSearch(
            @Param("search") String search, @Param("patientIds") List<Long> patientIds);

    @Query(
            """
            SELECT DISTINCT aj.patient.id
            FROM AlignerJourney aj
            LEFT JOIN aj.patient p
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = p.id
            LEFT JOIN pid.invitation i
            LEFT JOIN PatientDoctorOrganization pdo ON p.id = pdo.patient.id
            LEFT JOIN aj.tracking t
            LEFT JOIN t.treatmentPlan tp
            WHERE aj.patient.id IN (:patientIds)
                AND aj.creationStatus = 'DONE'
                AND aj.progressStatus IN ('IN_PROGRESS', 'NOT_STARTED', 'DEACTIVATED')
                AND aj.id = (
                    SELECT MAX(aj2.id)
                    FROM AlignerJourney aj2
                    WHERE aj2.patient.id = aj.patient.id
                        AND aj2.creationStatus = 'DONE'
                        AND aj2.progressStatus IN ('IN_PROGRESS', 'NOT_STARTED', 'DEACTIVATED')
                )
            """)
    List<Long> countDetailedAlignerJourneySummariesByPatientIds(@Param("patientIds") Set<Long> patientIds);

    @Query(
            """
            SELECT DISTINCT bj.patient.id
            FROM BracesJourney bj
            JOIN bj.patient p
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = p.id
            LEFT JOIN pid.invitation i
            WHERE bj.patient.id IN :patientIds
                AND bj.id = (
                    SELECT MAX(bj2.id)
                    FROM BracesJourney bj2
                    WHERE bj2.patient.id = bj.patient.id
                        AND EXISTS (SELECT 1 FROM bj2.appointments a)
                )
                AND EXISTS (SELECT 1 FROM bj.appointments a)
            """)
    List<Long> countBracesJourneySummariesByPatientIds(@Param("patientIds") Set<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT DISTINCT ON (i.id)
            i.id AS invitationId,
            i.status AS invitationStatus,
            i.is_invitation_sent AS isInvitationSent,
            i.created_at AS invitedAt,
            ic.code AS inviteCode,
            p.id AS patientId,
            p.first_name AS firstName,
            p.last_name AS lastName,
            CASE
                WHEN p.last_name IS NULL THEN p.first_name
                ELSE CONCAT(p.first_name, ' ', p.last_name)
            END AS fullName,
            tp.brand_name AS brandName,
            aj.treatment_type AS treatmentType,
            pdo.doctor_id AS doctorId,
            p.practice_location_name AS practiceLocationName,
            p.practice_location_id AS practiceLocationId,
            p.email AS email,
            p.mobile_no AS mobileNo,
            COALESCE(aj.doctor_treatment_start_date, bj.created_at) AS doctorTreatmentStartDate,
            p.age AS age,
            p.gender AS gender,
            p.customer_mapped_id AS customerMappedId,
            array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
            p.created_at AS createdAt,
            p.updated_at AS updatedAt,
            p.profile_picture_url AS profilePictureUrl,
            p.uuid AS UUID,
            p.chief_complaint AS chiefComplaint,
            p.country_code AS countryCode,
            p.patient_status AS patientStatus,
            p.added_by_user_id AS addedByUserId,
            pdo.patient_belongs_to AS patientBelongsTo,
            pdo.is_practice_assigned AS isPracticeAssigned,
            d.id AS practiceDoctorId,
            up.id AS practiceProfileId,
            abp.id AS addedByUserProfileId,
            o.id AS practiceOrganizationId,
            u.display_name AS practiceDisplayName,
            tp.id AS treatmentPlanId,
            aj.id AS alignerJourneyId,
            CASE
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'DEACTIVATED'
                    AND tp2.id = (
                        SELECT MAX(tp3.id)
                        FROM treatment_plan tp3
                        WHERE tp3.patient_id = p.id
                    )
                ) THEN 'REFINEMENT'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'ACTIVE'
                    AND aj.doctor_treatment_start_date IS NULL
                ) THEN 'ADD_TRACKING'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'ACTIVE'
                    AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) > NOW()
                ) THEN 'STARTING_SOON'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'ACTIVE'
                    AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) <= NOW()
                ) THEN 'ONGOING'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'PAUSED'
                ) THEN 'PAUSED'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'DRAFT'
                    AND NOT EXISTS (
                        SELECT 1 FROM treatment_plan tp3
                        WHERE tp3.patient_id = p.id
                        AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED')
                    )
                ) THEN 'IN_PLANNING'
                WHEN EXISTS (
                    SELECT 1 FROM braces_journey bj2
                    WHERE bj2.patient_id = p.id
                    AND bj2.braces_treatment_stage = 'DRAFT'
                ) THEN 'IN_PLANNING'
                WHEN p.is_getting_started_marked_all_as_read = TRUE
                    AND NOT EXISTS (
                        SELECT 1 FROM treatment_plan tp3
                        WHERE tp3.patient_id = p.id
                        AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED')
                    )
                THEN 'IN_PLANNING'
                WHEN (
                    p.is_getting_started_marked_all_as_read = TRUE OR
                    (
                        EXISTS (
                            SELECT 1 FROM file f
                            WHERE f.full_path LIKE ('/patients/' || p.id || '/Images/Pre treatment photos%')
                            AND f.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1 FROM file f
                            WHERE f.full_path LIKE ('/patients/' || p.id || '/3D Files/Scan files%')
                            AND f.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1 FROM case_information ci
                            WHERE ci.patient_id = p.id
                        )
                    )
                )
                AND NOT EXISTS (
                    SELECT 1 FROM treatment_plan tp3
                    WHERE tp3.patient_id = p.id
                    AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED')
                )
                THEN 'IN_PLANNING'
                ELSE 'ASSESSMENT'
            END AS treatmentStage
        FROM invitation i
        JOIN patient_invitation_details pi ON i.id = pi.invitation_id
        JOIN patient p ON pi.patient_id = p.id
        LEFT JOIN invitation_code ic ON i.id = ic.invitation_id
        JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
        JOIN user_profile up ON pdo.user_profile_id = up.id
        JOIN user_profile abp ON pdo.added_by_user_profile_id = abp.id
        JOIN users u ON up.user_id = u.id
        JOIN doctor d ON pdo.doctor_id = d.id
        JOIN organization o ON pdo.organization_id = o.id
        LEFT JOIN treatment_plan tp ON tp.patient_id = p.id
        LEFT JOIN tracking t ON tp.id = t.treatment_plan_id
        LEFT JOIN aligner_journey aj ON aj.patient_id = p.id
        LEFT JOIN braces_journey bj ON bj.patient_id = p.id
        LEFT JOIN appointment a ON bj.id = a.braces_journey_id
        WHERE p.id IN (:patientIds)
        AND pdo.organization_id = :organizationId
        AND i.inviter_user_type = :doctorUserType
        AND i.invited_user_type = :patientUserType
        AND i.status IN (:statusList)
        AND p.patient_status != :archiveStatus
        AND (
            (tp.id IS NULL OR t.id IS NULL OR (t.status = :draftStatus AND t.ask_patient_to_fill = FALSE))
            AND aj.id IS NULL
            AND (bj.id IS NULL OR a.id IS NULL)
        )
        AND (tp.id IS NULL OR tp.treatment_sub_type IN (:treatmentSubTypes))
        ORDER BY i.id, p.updated_at DESC
    """)
    List<WebLeadDetailsSummary> findWebLeadInvitationsByPatientIds(
            @Param("patientIds") List<Long> patientIds,
            @Param("organizationId") Long organizationId,
            @Param("doctorUserType") Integer doctorUserType,
            @Param("patientUserType") Integer patientUserType,
            @Param("statusList") List<Integer> statusList,
            @Param("treatmentSubTypes") List<String> treatmentSubTypes,
            @Param("archiveStatus") String archiveStatus,
            @Param("draftStatus") String draftStatus);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT DISTINCT ON(i1_0.id)
            i1_0.id AS invitationId,
            i1_0.status AS invitationStatus,
            i1_0.is_invitation_sent AS isInvitationSent,
            i1_0.created_at AS invitedAt,
            i2_0.code AS inviteCode,
            p1_0.patient_id AS patientId,
            p2_0.first_name AS firstName,
            p2_0.last_name AS lastName,
            p2_0.updated_at AS updatedAt,
            CASE
                WHEN p2_0.last_name IS NULL THEN p2_0.first_name
                ELSE (p2_0.first_name || ' ' || p2_0.last_name)
            END AS fullName,
            t1_0.brand_name AS brandName,
            d1_0.doctor_id AS doctorId,
            p2_0.practice_location_name AS practiceLocationName,
            p2_0.practice_location_id AS practiceLocationId,
            p2_0.email AS email,
            p2_0.mobile_no AS mobileNo,
            p2_0.age AS age,
            p2_0.gender AS gender,
            p2_0.customer_mapped_id AS customerMappedId,
            array_to_string(CAST(p2_0.product_type_names AS text[]), ',') AS productTypeNames,
            p2_0.created_at AS createdAt,
            COALESCE(a2_0.doctor_treatment_start_date, b1_0.created_at) AS doctorTreatmentStartDate,
            p2_0.profile_picture_url AS profilePictureUrl,
            p2_0.uuid AS UUID,
            p2_0.chief_complaint AS chiefComplaint,
            p2_0.country_code AS countryCode,
            p2_0.patient_status AS patientStatus,
            p2_0.added_by_user_id AS addedByUserId,
            d1_0.patient_belongs_to AS patientBelongsTo,
            d1_0.is_practice_assigned AS isPracticeAssigned,
            d1_0.doctor_id AS practiceDoctorId,
            d1_0.user_profile_id AS practiceProfileId,
            d1_0.added_by_user_profile_id AS addedByUserProfileId,
            d1_0.organization_id AS practiceOrganizationId,
            u2_0.display_name AS practiceDisplayName,
            a2_0.id,
            t1_0.id AS treatmentPlanId,
            a2_0.treatment_type AS treatmentType,
            CASE
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'DEACTIVATED'
                    AND tp2.id = (
                        SELECT MAX(tp3.id)
                        FROM treatment_plan tp3
                        WHERE tp3.patient_id = p.id
                    )
                ) THEN 'REFINEMENT'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'ACTIVE'
                    AND aj.doctor_treatment_start_date IS NULL
                ) THEN 'ADD_TRACKING'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'ACTIVE'
                    AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) > NOW()
                ) THEN 'STARTING_SOON'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'ACTIVE'
                    AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) <= NOW()
                ) THEN 'ONGOING'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'PAUSED'
                ) THEN 'PAUSED'
                WHEN EXISTS (
                    SELECT 1 FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                    AND tp2.status = 'DRAFT'
                    AND NOT EXISTS (
                        SELECT 1 FROM treatment_plan tp3
                        WHERE tp3.patient_id = p.id
                        AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED')
                    )
                ) THEN 'IN_PLANNING'
                WHEN EXISTS (
                    SELECT 1 FROM braces_journey bj2
                    WHERE bj2.patient_id = p.id
                    AND bj2.braces_treatment_stage = 'DRAFT'
                ) THEN 'IN_PLANNING'
                WHEN p.is_getting_started_marked_all_as_read = true
                    AND NOT EXISTS (
                        SELECT 1 FROM treatment_plan tp3
                        WHERE tp3.patient_id = p.id
                        AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED')
                    )
                THEN 'IN_PLANNING'
                WHEN (
                    p.is_getting_started_marked_all_as_read = TRUE OR
                    (
                        EXISTS (
                            SELECT 1 FROM file f
                            WHERE f.full_path LIKE ('/patients/' || p.id || '/Images/Pre treatment photos%')
                            AND f.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1 FROM file f
                            WHERE f.full_path LIKE ('/patients/' || p.id || '/3D Files/Scan files%')
                            AND f.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1 FROM case_information ci
                            WHERE ci.patient_id = p.id
                        )
                    )
                )
                AND NOT EXISTS (
                    SELECT 1 FROM treatment_plan tp3
                    WHERE tp3.patient_id = p.id
                    AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED')
                )
                THEN 'IN_PLANNING'
                ELSE 'ASSESSMENT'
            END AS treatmentStage
        FROM invitation i1_0
        JOIN patient_invitation_details p1_0 ON i1_0.id = p1_0.invitation_id
        JOIN patient p2_0 ON p2_0.id = p1_0.patient_id
        JOIN patient_doctor_organization d1_0 ON p2_0.id = d1_0.patient_id
        JOIN user_profile u1_0 ON u1_0.id = d1_0.user_profile_id
        JOIN users u2_0 ON u2_0.id = u1_0.user_id
        JOIN user_profile a1_0 ON a1_0.id = d1_0.added_by_user_profile_id
        JOIN doctor d2_0 ON d2_0.id = d1_0.doctor_id
        JOIN organization o1_0 ON o1_0.id = d1_0.organization_id
        LEFT JOIN invitation_code i2_0 ON i1_0.id = i2_0.invitation_id
        LEFT JOIN treatment_plan t1_0 ON t1_0.patient_id = p2_0.id
        LEFT JOIN tracking t2_0 ON t1_0.id = t2_0.treatment_plan_id
        LEFT JOIN aligner_journey a2_0 ON a2_0.patient_id = p2_0.id
        LEFT JOIN braces_journey b1_0 ON b1_0.patient_id = p2_0.id
        LEFT JOIN appointment a3_0 ON b1_0.id = a3_0.braces_journey_id
        WHERE
            p1_0.patient_id IN (:patientIds)
            AND d1_0.organization_id = :organizationId
            AND i1_0.inviter_user_type = :doctorUserType
            AND i1_0.invited_user_type = :patientUserType
            AND i1_0.status IN (:statusList)
            AND p2_0.patient_status != :archiveStatus
            AND (
                (t1_0.id IS NULL OR t2_0.id IS NULL OR (t2_0.status = :draftStatus AND t2_0.ask_patient_to_fill = FALSE))
                AND a2_0.id IS NULL
                AND (b1_0.id IS NULL OR a3_0.id IS NULL)
            )
            AND (
                t1_0.id IS NULL OR t1_0.treatment_sub_type IN (:treatmentSubTypes)
            )
            AND (
                :search IS NULL OR :search = ''
                OR (
                    LOWER(p2_0.first_name) LIKE LOWER('%' || :search || '%')
                    OR LOWER(p2_0.last_name) LIKE LOWER('%' || :search || '%')
                    OR LOWER(p2_0.email) LIKE LOWER('%' || :search || '%')
                    OR LOWER(p2_0.mobile_no) LIKE LOWER('%' || :search || '%')
                    OR LOWER(p2_0.customer_mapped_id) LIKE LOWER('%' || :search || '%')
                    OR (
                        LOWER(COALESCE(p2_0.first_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 1), '%'))
                        AND LOWER(COALESCE(p2_0.last_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 2), '%'))
                    )
                )
            )
        ORDER BY i1_0.id, p2_0.updated_at DESC
    """)
    List<WebLeadDetailsSummary> findWebLeadInvitationsByPatientIdsWithSearch(
            @Param("patientIds") List<Long> patientIds,
            @Param("organizationId") Long organizationId,
            @Param("doctorUserType") Integer doctorUserType,
            @Param("patientUserType") Integer patientUserType,
            @Param("statusList") List<Integer> statusList,
            @Param("treatmentSubTypes") List<String> treatmentSubTypes,
            @Param("archiveStatus") String archiveStatus,
            @Param("draftStatus") String draftStatus,
            @Param("search") String search);

    @Query(
            nativeQuery = true,
            value =
                    """
                    SELECT
                        aj.id AS alignerJourneyId,
                        p.id AS patientId,
                        p.uuid AS uuid,
                        p.email AS email,
                        p.mobile_no AS mobile,
                        p.country_code AS countryCode,
                        CASE
                            WHEN p.last_name IS NULL THEN p.first_name
                            ELSE CONCAT(p.first_name, ' ', p.last_name)
                        END AS fullName,
                        p.first_name AS firstName,
                        p.last_name AS lastName,
                        p.profile_image_id AS profilePictureId,
                        p.age AS age,
                        p.current_step AS currentStep,
                        p.gender AS gender,
                        p.customer_mapped_id AS customPatientId,
                        p.practice_location_name AS practiceLocationName,
                        p.practice_location_id AS practiceLocationId,
                        p.created_at AS addedOn,
                        p.created_at AS createdAt,
                        p.added_by_user_id AS addedByUserId,
                        i.status AS invitationStatus,
                        i.is_invitation_sent AS isInvitationSent,
                        pdo.patient_belongs_to AS patientBelongsTo,
                        p.profile_picture_url AS profilePictureUrl,
                        array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
                        aj.id AS alignerJourneyId,
                        tp.brand_name AS brandName,
                        pdo.doctor_id AS doctorId,
                        pdo_user.first_name AS addedByFirstName,
                        pdo_user.last_name AS addedByLastName,
                        pdo_user.salutation AS addedBySalutation,
                        pdo_user.profile_url AS addedByUserProfileUrl,
                        p.updated_at AS updatedAt,
                        p.archived_at AS archivedAt,
                        tp.id AS treatmentPlanId,
                        aj.treatment_type AS treatmentType,
                        aj.treatment_type AS treatmentType,
                        CASE
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                AND tp2.status = 'DEACTIVATED'
                                AND tp2.id = (
                                    SELECT MAX(tp3.id)
                                    FROM treatment_plan tp3
                                    WHERE tp3.patient_id = p.id
                                )
                            ) THEN 'REFINEMENT'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                AND tp2.status = 'ACTIVE'
                                AND aj.doctor_treatment_start_date IS NULL
                            ) THEN 'ADD_TRACKING'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                AND tp2.status = 'ACTIVE'
                                AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) > NOW()
                            ) THEN 'STARTING_SOON'
                            WHEN (
                                EXISTS (
                                  SELECT 1
                                  FROM aligner_journey aj2
                                  JOIN tracking t2 ON aj2.patient_id = t2.patient_id
                                  JOIN treatment_plan tp2 ON t2.treatment_plan_id = tp2.id
                                  WHERE aj2.patient_id = p.id
                                    AND aj2.doctor_treatment_start_date <= NOW()
                                    AND tp2.status = 'ACTIVE'
                                )
                                OR EXISTS (
                                    SELECT 1 FROM braces_journey bj2
                                    WHERE bj2.patient_id = p.id
                                    AND EXISTS (
                                        SELECT 1 FROM appointment a WHERE a.braces_journey_id = bj2.id
                                    )
                                )
                            ) THEN 'ONGOING'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'COMPLETE'
                            ) THEN 'COMPLETE'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                AND tp2.status = 'PAUSED'
                            ) THEN 'PAUSED'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                AND tp2.status = 'DRAFT'
                                AND NOT EXISTS (
                                    SELECT 1 FROM treatment_plan tp3
                                    WHERE tp3.patient_id = p.id
                                    AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                                )
                            ) THEN 'IN_PLANNING'
                            WHEN EXISTS (
                                SELECT 1 FROM braces_journey bj2
                                WHERE bj2.patient_id = p.id
                                AND bj2.braces_treatment_stage = 'DRAFT'
                            ) THEN 'IN_PLANNING'
                            WHEN p.is_getting_started_marked_all_as_read = true
                                AND NOT EXISTS (
                                    SELECT 1 FROM treatment_plan tp3
                                    WHERE tp3.patient_id = p.id
                                    AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                                )
                            THEN 'IN_PLANNING'
                            WHEN (
                                p.is_getting_started_marked_all_as_read = TRUE OR
                                (EXISTS (
                                    SELECT 1 FROM file f
                                    WHERE f.full_path LIKE ('/patients/' || p.id || '/Images/Pre treatment photos%')
                                    AND f.status = 'ACTIVE'
                                ) AND
                                EXISTS (
                                    SELECT 1 FROM file f
                                    WHERE f.full_path LIKE ('/patients/' || p.id || '/3D Files/Scan files%')
                                    AND f.status = 'ACTIVE'
                                ) AND
                                EXISTS (
                                    SELECT 1 FROM case_information ci
                                    WHERE ci.patient_id = p.id
                                ))
                            )
                            AND NOT EXISTS (
                                SELECT 1 FROM treatment_plan tp3
                                WHERE tp3.patient_id = p.id
                                AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                            )
                            THEN 'IN_PLANNING'
                            ELSE 'ASSESSMENT'
                        END AS treatmentStage
                    FROM patient p
                    LEFT JOIN treatment_plan tp ON tp.patient_id = p.id
                    LEFT JOIN tracking t ON tp.id = t.treatment_plan_id
                    LEFT JOIN aligner_journey aj ON aj.patient_id = p.id
                    LEFT JOIN braces_journey bj ON bj.patient_id = p.id
                    LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
                    LEFT JOIN invitation i ON pid.invitation_id = i.id
                    LEFT JOIN patient_doctor_organization pdo ON pdo.patient_id = p.id
                    LEFT JOIN user_profile pdo_p ON pdo_p.id = pdo.added_by_user_profile_id
                    LEFT JOIN users pdo_user ON pdo_user.id = pdo_p.id
                    WHERE p.id IN :patientIds
                    ORDER BY p.updated_at DESC;
                    """)
    List<CombinedPatientSummary> findPatientSummariesByIds(@Param("patientIds") List<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
                    SELECT
                        p.id AS patientId,
                        p.uuid AS uuid,
                        p.email AS email,
                        p.mobile_no AS mobile,
                        p.country_code AS countryCode,
                        CASE
                            WHEN p.last_name IS NULL THEN p.first_name
                            ELSE CONCAT(p.first_name, ' ', p.last_name)
                        END AS fullName,
                        p.first_name AS firstName,
                        p.last_name AS lastName,
                        p.profile_image_id AS profilePictureId,
                        p.age AS age,
                        p.gender AS gender,
                        p.customer_mapped_id AS customPatientId,
                        p.current_step AS currentStep,
                        p.practice_location_name AS practiceLocationName,
                        p.practice_location_id AS practiceLocationId,
                        p.created_at AS addedOn,
                        p.created_at AS createdAt,
                        p.added_by_user_id AS addedByUserId,
                        i.status AS invitationStatus,
                        i.is_invitation_sent AS isInvitationSent,
                        array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
                        pdo.patient_belongs_to AS patientBelongsTo,
                        pdo_user.first_name AS addedByFirstName,
                        pdo_user.last_name AS addedByLastName,
                        pdo_user.salutation AS addedBySalutation,
                        pdo_user.profile_url AS addedByUserProfileUrl,
                        p.profile_picture_url AS profilePictureUrl,
                        aj.id AS alignerJourneyId,
                        tp.brand_name AS brandName,
                        pdo.doctor_id AS doctorId,
                        p.updated_at AS updatedAt,
                        aj.treatment_type AS treatmentType,
                        p.archived_at AS archivedAt,
                        tp.id AS treatmentPlanId,
                        CASE
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'DEACTIVATED'
                                  AND tp2.id = (
                                      SELECT MAX(tp3.id)
                                      FROM treatment_plan tp3
                                      WHERE tp3.patient_id = p.id
                                  )
                            ) THEN 'REFINEMENT'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'ACTIVE'
                                  AND aj.doctor_treatment_start_date IS NULL
                            ) THEN 'ADD_TRACKING'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'ACTIVE'
                                  AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) > NOW()
                            ) THEN 'STARTING_SOON'
                            WHEN (
                                EXISTS (
                                  SELECT 1
                                  FROM aligner_journey aj2
                                  JOIN tracking t2 ON aj2.patient_id = t2.patient_id
                                  JOIN treatment_plan tp2 ON t2.treatment_plan_id = tp2.id
                                  WHERE aj2.patient_id = p.id
                                    AND aj2.doctor_treatment_start_date <= NOW()
                                    AND tp2.status = 'ACTIVE'
                                )
                                OR EXISTS (
                                    SELECT 1 FROM braces_journey bj2
                                    WHERE bj2.patient_id = p.id
                                    AND EXISTS (
                                        SELECT 1 FROM appointment a WHERE a.braces_journey_id = bj2.id
                                    )
                                )
                            ) THEN 'ONGOING'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'COMPLETE'
                            ) THEN 'COMPLETE'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'PAUSED'
                            ) THEN 'PAUSED'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'COMPLETE'
                            ) THEN 'COMPLETE'
                            WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'DRAFT'
                                  AND NOT EXISTS (
                                      SELECT 1 FROM treatment_plan tp3
                                      WHERE tp3.patient_id = p.id
                                        AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                                  )
                            ) THEN 'IN_PLANNING'
                            WHEN EXISTS (
                                SELECT 1 FROM braces_journey bj2
                                WHERE bj2.patient_id = p.id
                                  AND bj2.braces_treatment_stage = 'DRAFT'
                            ) THEN 'IN_PLANNING'
                            WHEN p.is_getting_started_marked_all_as_read = true
                              AND NOT EXISTS (
                                  SELECT 1 FROM treatment_plan tp3
                                  WHERE tp3.patient_id = p.id
                                    AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                              )
                            THEN 'IN_PLANNING'
                            WHEN (
                                p.is_getting_started_marked_all_as_read = TRUE OR
                                (
                                    EXISTS (
                                        SELECT 1 FROM file f
                                        WHERE f.full_path LIKE ('/patients/' || p.id || '/Images/Pre treatment photos%')
                                          AND f.status = 'ACTIVE'
                                    )
                                    AND EXISTS (
                                        SELECT 1 FROM file f
                                        WHERE f.full_path LIKE ('/patients/' || p.id || '/3D Files/Scan files%')
                                          AND f.status = 'ACTIVE'
                                    )
                                    AND EXISTS (
                                        SELECT 1 FROM case_information ci
                                        WHERE ci.patient_id = p.id
                                    )
                                )
                            )
                              AND NOT EXISTS (
                                  SELECT 1 FROM treatment_plan tp3
                                  WHERE tp3.patient_id = p.id
                                    AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                              )
                            THEN 'IN_PLANNING'
                            ELSE 'ASSESSMENT'
                        END AS treatmentStage
                    FROM patient p
                    LEFT JOIN treatment_plan tp ON tp.patient_id = p.id
                    LEFT JOIN tracking t ON tp.id = t.treatment_plan_id
                    LEFT JOIN aligner_journey aj ON aj.patient_id = p.id
                    LEFT JOIN braces_journey bj ON bj.patient_id = p.id
                    LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
                    LEFT JOIN patient_doctor_organization pdo ON pdo.patient_id = p.id
                    LEFT JOIN user_profile pdo_p ON pdo_p.id = pdo.added_by_user_profile_id
                    LEFT JOIN users pdo_user ON pdo_user.id = pdo_p.id
                    LEFT JOIN invitation i ON pid.invitation_id = i.id
                    WHERE p.id IN (:patientIds)
                      AND (
                          :search IS NULL OR :search = '' OR (
                              LOWER(COALESCE(p.email, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                              LOWER(COALESCE(p.mobile_no, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                              LOWER(COALESCE(p.customer_mapped_id, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                              LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                              LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                              (
                                  LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 1), '%'))
                                  AND
                                  LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 2), '%'))
                              )
                          )
                      )
                    ORDER BY p.updated_at DESC;
                    """)
    List<CombinedPatientSummary> findPatientSummariesByIdsWithSearch(
            @Param("patientIds") List<Long> patientIds, @Param("search") String search);

    @Query(
            nativeQuery = true,
            value =
                    """
                SELECT
                    p.id AS patientId,
                    p.uuid AS uuid,
                    p.email AS email,
                    p.mobile_no AS mobile,
                    p.country_code AS countryCode,
                    CASE
                        WHEN p.last_name IS NULL THEN p.first_name
                        ELSE CONCAT(p.first_name, ' ', p.last_name)
                    END AS fullName,
                    p.first_name AS firstName,
                    p.last_name AS lastName,
                     p.profile_image_id AS profilePictureId,
                    p.age AS age,
                    p.gender AS gender,
                    p.customer_mapped_id AS customPatientId,
                    p.practice_location_name AS practiceLocationName,
                    p.practice_location_id AS practiceLocationId,
                    array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
                    p.created_at AS addedOn,
                    p.created_at AS createdAt,
                    p.added_by_user_id AS addedByUserId,
                    i.status AS invitationStatus,
                    i.is_invitation_sent AS isInvitationSent,
                    pdo.patient_belongs_to AS patientBelongsTo,
                    p.profile_picture_url AS profilePictureUrl,
                    aj.id AS alignerJourneyId,
                    tp.brand_name AS brandName,
                    pdo.doctor_id AS doctorId,
                    p.current_step AS currentStep,
                    pdo_user.first_name AS addedByFirstName,
                    pdo_user.last_name AS addedByLastName,
                    pdo_user.salutation AS addedBySalutation,
                    pdo_user.profile_url AS addedByUserProfileUrl,
                    p.updated_at AS updatedAt,
                    aj.treatment_type AS treatmentType,
                    p.archived_at AS archivedAt,
                    tp.id AS treatmentPlanId,
                    CASE
                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan tp2
                            WHERE tp2.patient_id = p.id
                              AND tp2.status = 'DEACTIVATED'
                              AND tp2.id = (
                                  SELECT MAX(tp3.id)
                                  FROM treatment_plan tp3
                                  WHERE tp3.patient_id = p.id
                              )
                        ) THEN 'REFINEMENT'

                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan tp2
                            WHERE tp2.patient_id = p.id
                              AND tp2.status = 'ACTIVE'
                              AND aj.doctor_treatment_start_date IS NULL
                        ) THEN 'ADD_TRACKING'

                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan tp2
                            WHERE tp2.patient_id = p.id
                              AND tp2.status = 'ACTIVE'
                              AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) > NOW()
                        ) THEN 'STARTING_SOON'

                       WHEN (
                            EXISTS (
                              SELECT 1
                              FROM aligner_journey aj2
                              JOIN tracking t2 ON aj2.patient_id = t2.patient_id
                              JOIN treatment_plan tp2 ON t2.treatment_plan_id = tp2.id
                              WHERE aj2.patient_id = p.id
                                AND aj2.doctor_treatment_start_date <= NOW()
                                AND tp2.status = 'ACTIVE'
                            )
                            OR EXISTS (
                                SELECT 1 FROM braces_journey bj2
                                WHERE bj2.patient_id = p.id
                                AND EXISTS (
                                    SELECT 1 FROM appointment a WHERE a.braces_journey_id = bj2.id
                                )
                            )
                        ) THEN 'ONGOING'
                        WHEN EXISTS (
                                SELECT 1 FROM treatment_plan tp2
                                WHERE tp2.patient_id = p.id
                                  AND tp2.status = 'COMPLETE'
                            ) THEN 'COMPLETE'

                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan tp2
                            WHERE tp2.patient_id = p.id
                              AND tp2.status = 'PAUSED'
                        ) THEN 'PAUSED'

                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan tp2
                            WHERE tp2.patient_id = p.id
                              AND tp2.status = 'DRAFT'
                              AND NOT EXISTS (
                                  SELECT 1 FROM treatment_plan tp3
                                  WHERE tp3.patient_id = p.id
                                    AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                              )
                        ) THEN 'IN_PLANNING'

                        WHEN EXISTS (
                            SELECT 1 FROM braces_journey bj2
                            WHERE bj2.patient_id = p.id
                              AND bj2.braces_treatment_stage = 'DRAFT'
                        ) THEN 'IN_PLANNING'

                        WHEN p.is_getting_started_marked_all_as_read = TRUE
                          AND NOT EXISTS (
                              SELECT 1 FROM treatment_plan tp3
                              WHERE tp3.patient_id = p.id
                                AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                          )
                        THEN 'IN_PLANNING'

                        WHEN (
                            p.is_getting_started_marked_all_as_read = TRUE OR
                            (
                                EXISTS (
                                    SELECT 1 FROM file f
                                    WHERE f.full_path LIKE ('/patients/' || p.id || '/Images/Pre treatment photos%')
                                      AND f.status = 'ACTIVE'
                                )
                                AND EXISTS (
                                    SELECT 1 FROM file f
                                    WHERE f.full_path LIKE ('/patients/' || p.id || '/3D Files/Scan files%')
                                      AND f.status = 'ACTIVE'
                                )
                                AND EXISTS (
                                    SELECT 1 FROM case_information ci
                                    WHERE ci.patient_id = p.id
                                )
                            )
                        )
                        AND NOT EXISTS (
                            SELECT 1 FROM treatment_plan tp3
                            WHERE tp3.patient_id = p.id
                              AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                        )
                        THEN 'IN_PLANNING'

                        ELSE 'ASSESSMENT'
                    END AS treatmentStage
                FROM patient p
                LEFT JOIN treatment_plan tp ON tp.patient_id = p.id
                LEFT JOIN tracking t ON tp.id = t.treatment_plan_id
                LEFT JOIN aligner_journey aj ON aj.patient_id = p.id
                LEFT JOIN braces_journey bj ON bj.patient_id = p.id
                LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
                LEFT JOIN invitation i ON pid.invitation_id = i.id
                LEFT JOIN patient_doctor_organization pdo ON pdo.patient_id = p.id
                LEFT JOIN user_profile pdo_p ON pdo_p.id = pdo.added_by_user_profile_id
                LEFT JOIN users pdo_user ON pdo_user.id = pdo_p.id
                WHERE p.id IN (:patientIds)
                  AND p.patient_status = :patientStatus
                  AND (
                      :search IS NULL OR :search = '' OR (
                          LOWER(COALESCE(p.practice_location_name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                          LOWER(COALESCE(p.uuid, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                          LOWER(COALESCE(p.email, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                          LOWER(COALESCE(p.mobile_no, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                          LOWER(COALESCE(p.customer_mapped_id, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                          LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                          LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR (
                              LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 1), '%'))
                              AND LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 2), '%'))
                          )
                      )
                  )
                ORDER BY p.updated_at DESC;
        """)
    List<CombinedPatientSummary> findArchivedPatientSummariesByIdsWithSearch(
            @Param("patientIds") List<Long> patientIds,
            @Param("search") String search,
            @Param("patientStatus") String patientStatus);

    @Query(
            nativeQuery = true,
            value =
                    """
        SELECT
            aj.id AS alignerJourneyId,
            p.id AS patientId,
            p.uuid AS uuid,
            p.email AS email,
            p.mobile_no AS mobile,
            p.country_code AS countryCode,
            CASE
                WHEN p.last_name IS NULL THEN p.first_name
                ELSE CONCAT(p.first_name, ' ', p.last_name)
            END AS fullName,
            p.first_name AS firstName,
            p.last_name AS lastName,
            p.profile_image_id AS profilePictureId,
            p.age AS age,
            p.gender AS gender,
            p.current_step AS currentStep,
            p.customer_mapped_id AS customPatientId,
            p.practice_location_name AS practiceLocationName,
            p.practice_location_id AS practiceLocationId,
                        p.added_by_user_id AS addedByUserId,
            array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
            p.created_at AS addedOn,
            p.created_at AS createdAt,
            i.status AS invitationStatus,
            i.is_invitation_sent AS isInvitationSent,
            pdo.patient_belongs_to AS patientBelongsTo,
            p.profile_picture_url AS profilePictureUrl,
            aj.id AS alignerJourneyId,
            tp.brand_name AS brandName,
            pdo.doctor_id AS doctorId,
            pdo_user.first_name AS addedByFirstName,
            pdo_user.last_name AS addedByLastName,
            pdo_user.salutation AS addedBySalutation,
            pdo_user.profile_url AS addedByUserProfileUrl,
            p.updated_at AS updatedAt,
            p.archived_at AS archivedAt,
            tp.id AS treatmentPlanId,
            aj.treatment_type AS treatmentType,
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                        AND tp2.status = 'DEACTIVATED'
                        AND tp2.id = (
                            SELECT MAX(tp3.id)
                            FROM treatment_plan tp3
                            WHERE tp3.patient_id = p.id
                        )
                ) THEN 'REFINEMENT'

                WHEN EXISTS (
                    SELECT 1
                    FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                        AND tp2.status = 'ACTIVE'
                        AND aj.doctor_treatment_start_date IS NULL
                ) THEN 'ADD_TRACKING'

                WHEN EXISTS (
                    SELECT 1
                    FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                        AND tp2.status = 'ACTIVE'
                        AND COALESCE(aj.doctor_treatment_start_date, bj.created_at) > NOW()
                ) THEN 'STARTING_SOON'

               WHEN (
                    EXISTS (
                      SELECT 1
                      FROM aligner_journey aj2
                      JOIN tracking t2 ON aj2.patient_id = t2.patient_id
                      JOIN treatment_plan tp2 ON t2.treatment_plan_id = tp2.id
                      WHERE aj2.patient_id = p.id
                        AND aj2.doctor_treatment_start_date <= NOW()
                        AND tp2.status = 'ACTIVE'
                    )
                    OR EXISTS (
                        SELECT 1 FROM braces_journey bj2
                        WHERE bj2.patient_id = p.id
                        AND EXISTS (
                            SELECT 1 FROM appointment a WHERE a.braces_journey_id = bj2.id
                        )
                    )
                ) THEN 'ONGOING'
                WHEN EXISTS (
                     SELECT 1 FROM treatment_plan tp2
                     WHERE tp2.patient_id = p.id
                     AND tp2.status = 'COMPLETE'
                ) THEN 'COMPLETE'

                WHEN EXISTS (
                    SELECT 1
                    FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                        AND tp2.status = 'PAUSED'
                ) THEN 'PAUSED'

                WHEN EXISTS (
                    SELECT 1
                    FROM treatment_plan tp2
                    WHERE tp2.patient_id = p.id
                        AND tp2.status = 'DRAFT'
                        AND NOT EXISTS (
                            SELECT 1
                            FROM treatment_plan tp3
                            WHERE tp3.patient_id = p.id
                                AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                        )
                ) THEN 'IN_PLANNING'

                WHEN EXISTS (
                    SELECT 1
                    FROM braces_journey bj2
                    WHERE bj2.patient_id = p.id
                        AND bj2.braces_treatment_stage = 'DRAFT'
                ) THEN 'IN_PLANNING'

                WHEN p.is_getting_started_marked_all_as_read = true
                    AND NOT EXISTS (
                        SELECT 1
                        FROM treatment_plan tp3
                        WHERE tp3.patient_id = p.id
                            AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                    )
                THEN 'IN_PLANNING'

                WHEN (
                    p.is_getting_started_marked_all_as_read = TRUE OR
                    (
                        EXISTS (
                            SELECT 1
                            FROM file f
                            WHERE f.full_path LIKE ('/patients/' || p.id || '/Images/Pre treatment photos%')
                                AND f.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1
                            FROM file f
                            WHERE f.full_path LIKE ('/patients/' || p.id || '/3D Files/Scan files%')
                                AND f.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1
                            FROM case_information ci
                            WHERE ci.patient_id = p.id
                        )
                    )
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM treatment_plan tp3
                    WHERE tp3.patient_id = p.id
                        AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                )
                THEN 'IN_PLANNING'
                ELSE 'ASSESSMENT'
            END AS treatmentStage
        FROM patient p
        LEFT JOIN treatment_plan tp ON tp.patient_id = p.id
        LEFT JOIN tracking t ON tp.id = t.treatment_plan_id
        LEFT JOIN aligner_journey aj ON aj.patient_id = p.id
        LEFT JOIN braces_journey bj ON bj.patient_id = p.id
        LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
        LEFT JOIN invitation i ON pid.invitation_id = i.id
        LEFT JOIN patient_doctor_organization pdo ON pdo.patient_id = p.id
        LEFT JOIN user_profile pdo_p ON pdo_p.id = pdo.added_by_user_profile_id
        LEFT JOIN users pdo_user ON pdo_user.id = pdo_p.id
        WHERE p.id IN :patientIds
            AND p.patient_status = :patientStatus
        ORDER BY p.updated_at DESC
    """)
    List<CombinedPatientSummary> findArchivedPatientSummariesByIds(
            @Param("patientIds") List<Long> patientIds, @Param("patientStatus") String patientStatus);

    @Query(
            nativeQuery = true,
            value =
                    """
                    SELECT
                        p.id AS patientId,
                        p.email AS email,
                        p.mobile_no AS mobile,
                        p.country_code AS countryCode,
                        p.age AS age,
                        p.gender AS gender,
                        CASE
                            WHEN p.last_name IS NULL THEN p.first_name
                            ELSE CONCAT(p.first_name, ' ', p.last_name)
                        END AS fullName,
                        p.first_name AS firstName,
                        p.last_name AS lastName,
                        p.profile_image_id as profilePictureId,
                        p.customer_mapped_id AS customPatientId,
                        p.practice_location_name AS practiceLocationName,
                        p.practice_location_id AS practiceLocationId,
                        p.created_at AS addedOn,
                        p.created_at AS createdAt,
                        p.added_by_user_id AS addedByUserId,
                        p.is_tracking_enabled AS isTrackingEnabled,
                        p.is_stl_file_view_enabled AS isStlFileViewEnabled,
                        i.status AS invitationStatus,
                        i.is_invitation_sent AS isInvitationSent,
                        i.resent_invite_at AS resentInviteAt,
                        pdo.patient_belongs_to AS patientBelongsTo,
                        pdo_user.first_name AS addedByFirstName,
                        pdo_user.last_name AS addedByLastName,
                        pdo_user.salutation AS addedBySalutation,
                        pdo_user.profile_url AS addedByUserProfileUrl,
                        p.profile_picture_url AS profilePictureUrl,
                        array_to_string(CAST(p.product_type_names AS text[]), ',') AS productTypeNames,
                        pdo.doctor_id AS doctorId,
                        p.updated_at AS updatedAt,
                        p.archived_at AS archivedAt,
                        p.patient_type AS patientType,
                        p.has_read_existing_patient_form AS hasReadExistingPatientForm,
                        up.doctor_id AS practiceDoctorId,
                        up.id AS practiceProfileId,
                        up.organization_id AS practiceOrganizationId,
                        TRIM(
                            CONCAT(
                                CASE
                                    WHEN u.salutation IS NOT NULL AND u.salutation != ''
                                    THEN CONCAT(TRIM(u.salutation), '. ')
                                    ELSE ''
                                END,
                                CASE
                                    WHEN u.first_name IS NOT NULL AND u.first_name != ''
                                    THEN CONCAT(TRIM(u.first_name), ' ')
                                    ELSE ''
                                END,
                                CASE
                                    WHEN u.last_name IS NOT NULL AND u.last_name != ''
                                    THEN TRIM(u.last_name)
                                    ELSE ''
                                END
                            )
                        ) AS practiceName,
                        EXISTS (
                            SELECT 1 FROM patient_doctor_organization pdo_check
                            WHERE pdo_check.patient_id = p.id
                              AND pdo_check.org_user_profile_id = :checkUserProfileId
                        ) AS isYouPatient
                    FROM patient p
                    LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
                    LEFT JOIN invitation i ON pid.invitation_id = i.id
                    LEFT JOIN patient_doctor_organization pdo ON pdo.patient_id = p.id
                    LEFT JOIN user_profile pdo_p ON pdo_p.id = pdo.added_by_user_profile_id
                    LEFT JOIN users pdo_user ON pdo_user.id = pdo_p.id
                    LEFT JOIN user_profile up ON up.id = pdo.user_profile_id
                    LEFT JOIN doctor_billing db ON db.id = up.doctor_billing_id
                    LEFT JOIN users u ON u.id = up.user_id
                    WHERE p.id IN :patientIds
                    ORDER BY p.updated_at DESC
                    LIMIT :pageSize OFFSET (:pageNumber * :pageSize)
                    """)
    List<CombinedPatientSummary> getAssessmentPatientSummaries(
            @Param("patientIds") List<Long> patientIds,
            @Param("checkUserProfileId") Long checkUserProfileId,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT
                p.id AS patientId,
                p.email AS email,
                p.mobile_no AS mobile,
                p.country_code AS countryCode,
                p.age AS age,
                p.gender AS gender,
                CASE
                    WHEN p.last_name IS NULL THEN p.first_name
                    ELSE CONCAT(p.first_name, ' ', p.last_name)
                END AS fullName,
                p.first_name AS firstName,
                p.last_name AS lastName,
                p.profile_image_id as profilePictureId,
                p.customer_mapped_id AS customPatientId,
                p.practice_location_name AS practiceLocationName,
                p.created_at AS createdAt,
                pdo_user.salutation AS addedBySalutation,
                pdo_user.first_name AS addedByFirstName,
                pdo_user.last_name AS addedByLastName,
                p.profile_picture_url AS profilePictureUrl
            FROM patient p
            LEFT JOIN patient_doctor_organization pdo ON pdo.patient_id = p.id
            LEFT JOIN user_profile pdo_p ON pdo_p.id = pdo.added_by_user_profile_id
            LEFT JOIN users pdo_user ON pdo_user.id = pdo_p.id
            WHERE p.id IN :patientIds
            ORDER BY p.updated_at DESC
            LIMIT :pageSize OFFSET (:pageNumber * :pageSize)
            """)
    List<CombinedPatientSummary> getCustomerPatientDetails(
            @Param("patientIds") List<Long> patientIds,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            value =
                    """
    WITH RankedTreatmentPlans AS (
        SELECT
            t.patient_id,
            t.brand_name,
            t.approver_status,
            t.created_at,
            t.updated_at,
            t.start_date,
            t.end_date,
            o.status AS order_status,
            ROW_NUMBER() OVER (
                PARTITION BY t.patient_id
                ORDER BY
                    CASE
                        WHEN t.approver_status = 'APPROVED' THEN 1
                        WHEN t.approver_status = 'PENDING_APPROVAL' THEN 2
                        ELSE 3
                    END,
                    t.created_at DESC
            ) as rn
        FROM treatment_plan t
        LEFT JOIN orders o ON t.linked_order_id = o.id
        WHERE t.patient_id IN :patientIds
        AND t.status = 'DRAFT'
        AND t.approver_status IS NOT NULL
        AND (t.approver_status = 'APPROVED' OR t.approver_status = 'PENDING_APPROVAL')
    )
    SELECT
        patient_id as patientId,
        brand_name as brandName,
        approver_status as approverStatus,
        created_at as createdAt,
        order_status as orderStatus,
        updated_at as updatedAt,
        start_date as startDate,
        end_date as endDate
    FROM RankedTreatmentPlans
    WHERE rn = 1
    """,
            nativeQuery = true)
    List<TreatmentPlanPatientSummary> findLatestTreatmentPlanPerPatient(@Param("patientIds") List<Long> patientIds);

    @Query(
            value =
                    """
        WITH RankedTreatmentPlans AS (
            SELECT
                t.patient_id,
                t.brand_name,
                t.status,
                t.created_at,
                t.updated_at,
                t.start_date,
                t.end_date,
                o.status AS order_status,
                mb.status AS manufacturing_status,
                CASE
                    WHEN tr.id IS NOT NULL THEN true
                    ELSE false
                END AS tracking_added,
                tr.aligner_journey_id AS alignerJourneyId,
                ROW_NUMBER() OVER (
                    PARTITION BY t.patient_id
                    ORDER BY
                        CASE
                            WHEN t.status = 'ACTIVE' THEN 1
                            WHEN t.status = 'PAUSED' THEN 2
                            ELSE 3
                        END,
                        t.created_at DESC
                ) AS tp_rn
            FROM treatment_plan t
            LEFT JOIN orders o ON t.linked_order_id = o.id
            LEFT JOIN tracking tr ON t.id = tr.treatment_plan_id
            LEFT JOIN (
                SELECT
                    mb.treatment_plan_id,
                    mb.status,
                    ROW_NUMBER() OVER (PARTITION BY mb.treatment_plan_id ORDER BY mb.created_at DESC) AS mb_rn
                FROM manufacturing_batches mb
            ) mb ON t.id = mb.treatment_plan_id AND mb.mb_rn = 1
            WHERE t.patient_id IN :patientIds
            AND t.status IN ('ACTIVE', 'PAUSED')
        )
        SELECT
            patient_id AS patientId,
            brand_name AS brandName,
            status AS status,
            created_at AS createdAt,
            updated_at AS updatedAt,
            start_date AS startDate,
            end_date AS endDate,
            order_status AS orderStatus,
            manufacturing_status AS manufacturingStatus,
            tracking_added AS trackingAdded,
            alignerJourneyId AS alignerJourneyId
        FROM RankedTreatmentPlans
        WHERE tp_rn = 1
        """,
            nativeQuery = true)
    List<TreatmentPlanPatientSummary> findLatestManufacturingTreatmentPlanPerPatient(
            @Param("patientIds") List<Long> patientIds);

    @Query(
            value =
                    """
            WITH RankedTreatmentPlans AS (
                SELECT
                    t.patient_id,
                    t.brand_name,
                    t.status,
                    t.created_at,
                    t.updated_at,
                    t.start_date,
                    t.end_date,
                    o.status AS order_status,
                    mb.status AS manufacturing_status,
                    CASE
                        WHEN tr.id IS NOT NULL THEN true
                        ELSE false
                    END AS tracking_added,
                    tr.aligner_journey_id AS alignerJourneyId,
                    ROW_NUMBER() OVER (
                        PARTITION BY t.patient_id
                        ORDER BY
                            CASE
                                WHEN t.status = 'ACTIVE' THEN 1
                                WHEN t.status = 'PAUSED' THEN 2
                                WHEN t.status = 'DEACTIVATED' THEN 3
                                WHEN t.status = 'DRAFT' THEN 4
                                ELSE 3
                            END,
                            t.created_at DESC
                    ) AS tp_rn
                FROM treatment_plan t
                LEFT JOIN orders o ON t.linked_order_id = o.id
                LEFT JOIN tracking tr ON t.id = tr.treatment_plan_id
                LEFT JOIN (
                    SELECT
                        mb.treatment_plan_id,
                        mb.status,
                        ROW_NUMBER() OVER (PARTITION BY mb.treatment_plan_id ORDER BY mb.created_at DESC) AS mb_rn
                    FROM manufacturing_batches mb
                ) mb ON t.id = mb.treatment_plan_id AND mb.mb_rn = 1
                WHERE t.patient_id IN :patientIds
                AND t.status IN ('ACTIVE', 'PAUSED')
            )
            SELECT
                patient_id AS patientId,
                brand_name AS brandName,
                status AS status,
                created_at AS createdAt,
                updated_at AS updatedAt,
                start_date AS startDate,
                end_date AS endDate,
                order_status AS orderStatus,
                manufacturing_status AS manufacturingStatus,
                tracking_added AS trackingAdded,
                alignerJourneyId AS alignerJourneyId
            FROM RankedTreatmentPlans
            WHERE tp_rn = 1
            """,
            nativeQuery = true)
    List<TreatmentPlanPatientSummary> findTreatmentPlanPerPatient(@Param("patientIds") List<Long> patientIds);
}
