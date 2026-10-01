package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.aligner.enums.TrackingType;
import com.dentalstack.patient.feature.aligner.projection.PatientDueStatusCounts;
import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import com.dentalstack.patient.feature.order.projection.PatientCaseProjection;
import com.dentalstack.patient.feature.order.projection.PatientListSummaryV2;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.projection.PatientStageResult;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.Nullable;

public interface PatientDoctorOrganizationRepository extends JpaRepository<PatientDoctorOrganization, Long> {
    @Query("SELECT pdo.patient.id FROM PatientDoctorOrganization pdo " + "WHERE pdo.organization.id = :organizationId")
    List<Long> findPatientIdsByOrganizationId(@Param("organizationId") Long organizationId);

    @Query("SELECT pdo.patient.id FROM PatientDoctorOrganization pdo " + "WHERE pdo.organization.id = :organizationId "
            + "AND pdo.patient.patientStatus = :patientStatus")
    List<Long> findPatientIdsByOrganizationIdWithStatus(
            @Param("organizationId") Long organizationId, @Param("patientStatus") PatientStatus patientStatus);

    @Query("SELECT pdo.patient FROM PatientDoctorOrganization pdo " + "WHERE pdo.organization.id = :organizationId")
    List<Patient> findPatientsByOrganizationId(@Param("organizationId") Long organizationId);

    @Query(
            """
            SELECT pdo
            FROM PatientDoctorOrganization pdo
            JOIN FETCH pdo.patient p
            JOIN FETCH pdo.doctor d
            JOIN FETCH pdo.organization o
            LEFT JOIN FETCH pdo.userProfile up
            LEFT JOIN FETCH pdo.orgUserProfile oup
            LEFT JOIN FETCH oup.doctor oupd
            LEFT JOIN FETCH up.doctor doc
            LEFT JOIN FETCH up.organization org
            LEFT JOIN FETCH up.inviterProfile inviter
            LEFT JOIN FETCH inviter.user inviterUser
            LEFT JOIN FETCH inviter.doctor inviterDoctor
            LEFT JOIN FETCH inviter.organization inviterOrg
            LEFT JOIN FETCH up.user u
            LEFT JOIN FETCH up.roles r
            LEFT JOIN FETCH up.doctorBilling dcb
            WHERE pdo.patient.id = :patientId
            """)
    Optional<PatientDoctorOrganization> findPatientDoctorOrganizationsWithPatientByPatientId(
            @Param("patientId") Long patientId);

    @Query("SELECT pdo.patient FROM PatientDoctorOrganization pdo " + "WHERE pdo.doctor.id = :doctorId "
            + "AND pdo.organization.id = :organizationId "
            + "AND pdo.userProfile.id = :profileId")
    List<Patient> findPatientsByDoctorOrgAndProfile(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);

    @Query("SELECT pdo.patient.id FROM PatientDoctorOrganization pdo " + "WHERE pdo.doctor.id = :doctorId "
            + "AND pdo.organization.id = :organizationId "
            + "AND pdo.userProfile.id = :profileId")
    List<Long> findPatientIdsByDoctorOrgAndProfile(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);

    @Query(
            """
    SELECT pdo.patient.id FROM PatientDoctorOrganization pdo
    WHERE pdo.organization.id = :organizationId
    AND pdo.patient.patientStatus != 'ARCHIVE'
""")
    List<Long> findPatientIdsByOrganizationIdWithoutArchive(@Param("organizationId") Long organizationId);

    @Query(
            value =
                    """
            WITH filtered_patients AS (
                SELECT
                    tp.id as treatment_plan_id,
                    p.id as patient_id,
                    MAX(mb.updated_at) as last_manufacturing_date,
                    CASE
                        -- REFINEMENT: Patient has at least one ACTIVE and one DEACTIVATED treatment plan
                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'ACTIVE'
                        ) AND EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                        ) THEN 'REFINEMENT'

                        -- ARCHIVED: Patient has DEACTIVATED plans but NO ACTIVE or PAUSED plans
                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                        ) AND NOT EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status IN ('ACTIVE', 'PAUSED')
                        ) THEN 'ARCHIVED'

                        -- NEW: Patient has only ACTIVE/PAUSED plans (no DEACTIVATED)
                        ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Count processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            CASE
                                WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                    THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                ELSE 0
                            END +
                            CASE
                                WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                    THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                ELSE 0
                            END
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
                FROM patient_doctor_organization pdo
                JOIN patient p ON p.id = pdo.patient_id
                JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                WHERE pdo.organization_id = :organizationId
                  AND p.patient_status != 'ARCHIVE'
                  AND mb.is_archived != true
                  AND (
                      :searchTerm IS NULL OR :searchTerm = '' OR (
                          LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR (
                              CASE
                                  WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                      AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                  ELSE FALSE
                              END
                          )
                      )
                  )
                  AND (
                      :dueByFilter = 'ALL'
                      OR (
                          :dueByFilter = 'NOT_ADDED' AND
                          NOT EXISTS (
                              SELECT 1 FROM aligner_journey aj WHERE aj.patient_id = p.id
                          )
                      )
                  )
                GROUP BY tp.id, p.id, tp.aligner_details_metadata
            )
            SELECT treatment_plan_id
            FROM filtered_patients
            WHERE
                (:caseType = 'ALL' OR
                 (:caseType = 'NEW' AND case_type = 'NEW') OR
                 (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                 (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                 (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                 (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
                 -- Exclude treatment plans with 0 pending aligners
                AND (total_aligners_count - processed_aligners_count) > 0
            ORDER BY
                CASE WHEN last_manufacturing_date IS NULL THEN 0 ELSE 1 END,
                last_manufacturing_date DESC NULLS LAST,
                patient_id
            LIMIT :limit OFFSET :offset
            """,
            nativeQuery = true)
    List<Long> findTreatmentPlanIdsByPaginationDesc(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
        WITH filtered_patients AS (
            SELECT
                tp.id as treatment_plan_id,
                pdo.patient_id,
                MAX(mb.updated_at) as last_manufacturing_date,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_active
                        WHERE tp_active.patient_id = p.id
                          AND tp_active.status = 'ACTIVE'
                    )
                    AND EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_deactivated
                        WHERE tp_deactivated.patient_id = p.id
                          AND tp_deactivated.status = 'DEACTIVATED'
                    )
                    THEN 'REFINEMENT'
                    WHEN EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_only_deactivated
                        WHERE tp_only_deactivated.patient_id = p.id
                          AND tp_only_deactivated.status = 'DEACTIVATED'
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_other
                        WHERE tp_other.patient_id = p.id
                          AND tp_other.status IN ('ACTIVE', 'PAUSED')
                    )
                    THEN 'ARCHIVED'
                    ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Calculate processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            COALESCE(
                                CASE
                                    WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                        THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            ) +
                            COALESCE(
                                CASE
                                    WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                        THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            )
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
            WHERE pdo.organization_id = :organizationId
              AND p.patient_status != 'ARCHIVE'
              AND mb.is_archived != true
              -- MANDATORY: Aligner journey must exist for each patient
              AND EXISTS (
                  SELECT 1 FROM aligner_journey aj
                  WHERE aj.patient_id = pdo.patient_id
                  AND aj.creation_status = 'DONE'
                  AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
              )
              -- Search filter applied first
              AND (
                  :searchTerm IS NULL OR (
                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR (
                          CASE
                              WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                  LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                  AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                              ELSE FALSE
                          END
                      )
                  )
              )
              -- Due-by filter logic - only check if one of the 4 specific filters
              AND (
                  :dueByFilter NOT IN ('OVERDUE', 'DUE_TODAY', 'DUE_THIS_WEEK', 'DUE_LATER')
                  OR (
                      :dueByFilter = 'OVERDUE' AND
                      EXISTS (
                          SELECT 1 FROM aligner_journey aj
                          JOIN aligner a ON aj.id = a.aligner_journey_id
                          JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                          JOIN (
                              SELECT mb.treatment_plan_id,
                                     CASE
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                              AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                         THEN mb.upper_aligner_end
                                         WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN mb.lower_aligner_end
                                         ELSE 0
                                     END AS max_aligner_end
                              FROM manufacturing_batches mb
                              WHERE mb.id = (
                                  SELECT MAX(mb2.id)
                                  FROM manufacturing_batches mb2
                                  WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                              )
                          ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                          WHERE aj.patient_id = pdo.patient_id
                          AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                          AND aj.creation_status = 'DONE'
                          AND aj.id = (
                              SELECT MAX(aj2.id)
                              FROM aligner_journey aj2
                              WHERE aj2.patient_id = pdo.patient_id
                              AND aj2.creation_status = 'DONE'
                              AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                          )
                          AND a.sr_no = mb_latest.max_aligner_end
                          AND a.end_date < CURRENT_DATE
                      )
                  )
                  OR (
                      :dueByFilter = 'DUE_TODAY' AND
                      EXISTS (
                          SELECT 1 FROM aligner_journey aj
                          JOIN aligner a ON aj.id = a.aligner_journey_id
                          JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                          JOIN (
                              SELECT mb.treatment_plan_id,
                                     CASE
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                              AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                         THEN mb.upper_aligner_end
                                         WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN mb.lower_aligner_end
                                         ELSE 0
                                     END AS max_aligner_end
                              FROM manufacturing_batches mb
                              WHERE mb.id = (
                                  SELECT MAX(mb2.id)
                                  FROM manufacturing_batches mb2
                                  WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                              )
                          ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                          WHERE aj.patient_id = pdo.patient_id
                          AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                          AND aj.creation_status = 'DONE'
                          AND aj.id = (
                              SELECT MAX(aj2.id)
                              FROM aligner_journey aj2
                              WHERE aj2.patient_id = pdo.patient_id
                              AND aj2.creation_status = 'DONE'
                              AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                          )
                          AND a.sr_no = mb_latest.max_aligner_end
                          AND a.end_date = CURRENT_DATE
                      )
                  )
                  OR (
                      :dueByFilter = 'DUE_THIS_WEEK' AND
                      EXISTS (
                          SELECT 1 FROM aligner_journey aj
                          JOIN aligner a ON aj.id = a.aligner_journey_id
                          JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                          JOIN (
                              SELECT mb.treatment_plan_id,
                                     CASE
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                              AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                         THEN mb.upper_aligner_end
                                         WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN mb.lower_aligner_end
                                         ELSE 0
                                     END AS max_aligner_end
                              FROM manufacturing_batches mb
                              WHERE mb.id = (
                                  SELECT MAX(mb2.id)
                                  FROM manufacturing_batches mb2
                                  WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                              )
                          ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                          WHERE aj.patient_id = pdo.patient_id
                          AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                          AND aj.creation_status = 'DONE'
                          AND aj.id = (
                              SELECT MAX(aj2.id)
                              FROM aligner_journey aj2
                              WHERE aj2.patient_id = pdo.patient_id
                              AND aj2.creation_status = 'DONE'
                              AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                          )
                          AND a.sr_no = mb_latest.max_aligner_end
                          AND a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
                      )
                  )
                  OR (
                      :dueByFilter = 'DUE_LATER' AND
                      EXISTS (
                          SELECT 1 FROM aligner_journey aj
                          JOIN aligner a ON aj.id = a.aligner_journey_id
                          JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                          JOIN (
                              SELECT mb.treatment_plan_id,
                                     CASE
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                              AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                         WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                         THEN mb.upper_aligner_end
                                         WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                         THEN mb.lower_aligner_end
                                         ELSE 0
                                     END AS max_aligner_end
                              FROM manufacturing_batches mb
                              WHERE mb.id = (
                                  SELECT MAX(mb2.id)
                                  FROM manufacturing_batches mb2
                                  WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                              )
                          ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                          WHERE aj.patient_id = pdo.patient_id
                          AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                          AND aj.creation_status = 'DONE'
                          AND aj.id = (
                              SELECT MAX(aj2.id)
                              FROM aligner_journey aj2
                              WHERE aj2.patient_id = pdo.patient_id
                              AND aj2.creation_status = 'DONE'
                              AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                          )
                          AND a.sr_no = mb_latest.max_aligner_end
                          AND a.end_date > CURRENT_DATE + INTERVAL '7 days'
                      )
                  )
              )
            GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
        )
        SELECT treatment_plan_id
        FROM filtered_patients
        WHERE
            (:caseType = 'ALL' OR
             (:caseType = 'NEW' AND case_type = 'NEW') OR
             (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
             (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
             (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
             (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
        -- Exclude treatment plans with 0 pending aligners
        AND (total_aligners_count - processed_aligners_count) > 0
        ORDER BY
            CASE WHEN last_manufacturing_date IS NULL THEN 0 ELSE 1 END,
            last_manufacturing_date DESC NULLS LAST,
            patient_id
        LIMIT :limit OFFSET :offset
        """,
            nativeQuery = true)
    List<Long> findPatientIdsByTreatmentPlanPaginationWithDueByDesc(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
            WITH filtered_patients AS (
                SELECT
                    tp.id as treatment_plan_id,
                    pdo.patient_id,
                    MAX(mb.updated_at) as last_manufacturing_date,
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_active
                            WHERE tp_active.patient_id = p.id
                              AND tp_active.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_deactivated
                            WHERE tp_deactivated.patient_id = p.id
                              AND tp_deactivated.status = 'DEACTIVATED'
                        )
                        THEN 'REFINEMENT'
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_only_deactivated
                            WHERE tp_only_deactivated.patient_id = p.id
                              AND tp_only_deactivated.status = 'DEACTIVATED'
                        )
                        AND NOT EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_other
                            WHERE tp_other.patient_id = p.id
                              AND tp_other.status IN ('ACTIVE', 'PAUSED')
                        )
                        THEN 'ARCHIVED'
                        ELSE 'NEW'
                        END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Calculate processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            COALESCE(
                                CASE
                                    WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                        THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            ) +
                            COALESCE(
                                CASE
                                    WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                        THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            )
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
                FROM patient_doctor_organization pdo
                JOIN patient p ON p.id = pdo.patient_id
                JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                WHERE pdo.organization_id = :organizationId
                  AND p.patient_status != 'ARCHIVE'
                  AND mb.is_archived != true
                  -- MANDATORY: Aligner journey must exist for each patient
                  AND EXISTS (
                      SELECT 1 FROM aligner_journey aj
                      WHERE aj.patient_id = pdo.patient_id
                      AND aj.creation_status = 'DONE'
                      AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                  )
                  -- Search filter applied first
                  AND (
                      :searchTerm IS NULL OR (
                          LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR (
                              CASE
                                  WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                      AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                  ELSE FALSE
                              END
                          )
                      )
                  )
                  -- Due-by filter logic - only check if one of the 4 specific filters
                  AND (
                      :dueByFilter NOT IN ('OVERDUE', 'DUE_TODAY', 'DUE_THIS_WEEK', 'DUE_LATER')
                      OR (
                          :dueByFilter = 'OVERDUE' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date < CURRENT_DATE
                          )
                      )
                      OR (
                          :dueByFilter = 'DUE_TODAY' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date = CURRENT_DATE
                          )
                      )
                      OR (
                          :dueByFilter = 'DUE_THIS_WEEK' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
                          )
                      )
                      OR (
                          :dueByFilter = 'DUE_LATER' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date > CURRENT_DATE + INTERVAL '7 days'
                          )
                      )
                  )
                GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
            )
            SELECT treatment_plan_id
            FROM filtered_patients
            WHERE
                (:caseType = 'ALL' OR
                 (:caseType = 'NEW' AND case_type = 'NEW') OR
                 (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                 (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                 (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                 (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
             -- Exclude treatment plans with 0 pending aligners
            AND (total_aligners_count - processed_aligners_count) > 0
            ORDER BY
                CASE WHEN last_manufacturing_date IS NULL THEN 0 ELSE 1 END,
                last_manufacturing_date ASC NULLS FIRST,
                patient_id ASC
            LIMIT :limit OFFSET :offset
            """,
            nativeQuery = true)
    List<Long> findPatientIdsByTreatmentPlanPaginationWithDueByAsc(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
        WITH filtered_patients AS (
            SELECT
                tp.id as treatment_plan_id,
                pdo.patient_id,
                MAX(mb.updated_at) as last_manufacturing_date,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_active
                        WHERE tp_active.patient_id = p.id
                          AND tp_active.status = 'ACTIVE'
                    )
                    AND EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_deactivated
                        WHERE tp_deactivated.patient_id = p.id
                          AND tp_deactivated.status = 'DEACTIVATED'
                    )
                    THEN 'REFINEMENT'
                    WHEN EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_only_deactivated
                        WHERE tp_only_deactivated.patient_id = p.id
                          AND tp_only_deactivated.status = 'DEACTIVATED'
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_other
                        WHERE tp_other.patient_id = p.id
                          AND tp_other.status IN ('ACTIVE', 'PAUSED')
                    )
                    THEN 'ARCHIVED'
                    ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Calculate processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            COALESCE(
                                CASE
                                    WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                        THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            ) +
                            COALESCE(
                                CASE
                                    WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                        THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            )
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
            WHERE pdo.organization_id = :organizationId
              AND p.patient_status != 'ARCHIVE'
              AND mb.is_archived != true
              AND (
                  :searchTerm IS NULL OR :searchTerm = '' OR (
                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR (
                          CASE
                              WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                  LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                  AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                              ELSE FALSE
                          END
                      )
                  )
              )
              AND (
                  :dueByFilter = 'ALL'
                  OR (
                      :dueByFilter = 'NOT_ADDED' AND
                      NOT EXISTS (
                          SELECT 1 FROM aligner_journey aj WHERE aj.patient_id = p.id
                      )
                  )
              )
            GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
        )
        SELECT treatment_plan_id
        FROM filtered_patients
        WHERE
            (:caseType = 'ALL' OR
             (:caseType = 'NEW' AND case_type = 'NEW') OR
             (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
             (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
             (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
             (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
         -- Exclude treatment plans with 0 pending aligners
        AND (total_aligners_count - processed_aligners_count) > 0
        ORDER BY
            CASE WHEN last_manufacturing_date IS NULL THEN 0 ELSE 1 END,
            last_manufacturing_date ASC NULLS LAST,
            patient_id
        LIMIT :limit OFFSET :offset
        """,
            nativeQuery = true)
    List<Long> findTreatmentPlanIdsByPaginationAsc(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
        WITH filtered_patients AS (
            SELECT
                tp.id as treatment_plan_id,
                pdo.patient_id,
                MAX(mb.updated_at) as last_manufacturing_date,
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_active
                        WHERE tp_active.patient_id = p.id
                          AND tp_active.status = 'ACTIVE'
                    )
                    AND EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_deactivated
                        WHERE tp_deactivated.patient_id = p.id
                          AND tp_deactivated.status = 'DEACTIVATED'
                    )
                    THEN 'REFINEMENT'
                    WHEN EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_only_deactivated
                        WHERE tp_only_deactivated.patient_id = p.id
                          AND tp_only_deactivated.status = 'DEACTIVATED'
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM treatment_plan tp_other
                        WHERE tp_other.patient_id = p.id
                          AND tp_other.status IN ('ACTIVE', 'PAUSED')
                    )
                    THEN 'ARCHIVED'
                    ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Calculate processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            COALESCE(
                                CASE
                                    WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                        THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            ) +
                            COALESCE(
                                CASE
                                    WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                        THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            )
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
            WHERE pdo.organization_id = :organizationId
              AND p.patient_status != 'ARCHIVE'
              AND mb.is_archived != true
              AND (
                  :searchTerm IS NULL OR :searchTerm = '' OR (
                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                      OR (
                          CASE
                              WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                  LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                  AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                              ELSE FALSE
                          END
                      )
                  )
              )
              AND (
                  :dueByFilter = 'ALL'
                  OR (
                      :dueByFilter = 'NOT_ADDED' AND
                      NOT EXISTS (
                          SELECT 1 FROM aligner_journey aj WHERE aj.patient_id = p.id
                      )
                  )
              )
            GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
        )
        SELECT treatment_plan_id
        FROM filtered_patients
        WHERE
            (:caseType = 'ALL' OR
             (:caseType = 'NEW' AND case_type = 'NEW') OR
             (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
             (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
             (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
             (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
         -- Exclude treatment plans with 0 pending aligners
        AND (total_aligners_count - processed_aligners_count) > 0
        AND p.id IN (:patientIds)
        ORDER BY
            CASE WHEN last_manufacturing_date IS NULL THEN 0 ELSE 1 END,
            last_manufacturing_date ASC NULLS LAST,
            patient_id
        LIMIT :limit OFFSET :offset
        """,
            nativeQuery = true)
    List<Long> findTreatmentPlanIdsForCustomInternalUserPaginationAsc(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("patientIds") List<Long> patientIds,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
            WITH filtered_patients AS (
                SELECT
                    tp.id as treatment_plan_id,
                    p.id as patient_id,
                    MAX(mb.updated_at) as last_manufacturing_date,
                    CASE
                        -- REFINEMENT: Patient has at least one ACTIVE and one DEACTIVATED treatment plan
                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'ACTIVE'
                        ) AND EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                        ) THEN 'REFINEMENT'

                        -- ARCHIVED: Patient has DEACTIVATED plans but NO ACTIVE or PAUSED plans
                        WHEN EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                        ) AND NOT EXISTS (
                            SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status IN ('ACTIVE', 'PAUSED')
                        ) THEN 'ARCHIVED'

                        -- NEW: Patient has only ACTIVE/PAUSED plans (no DEACTIVATED)
                        ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Count processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            CASE
                                WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                    THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                ELSE 0
                            END +
                            CASE
                                WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                    THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                ELSE 0
                            END
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
                FROM patient_doctor_organization pdo
                JOIN patient p ON p.id = pdo.patient_id
                JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                WHERE pdo.organization_id = :organizationId
                  AND p.patient_status != 'ARCHIVE'
                  AND p.id IN (:patientIds)  -- Added this line to filter by patient IDs
                  AND mb.is_archived != true
                  AND (
                      :searchTerm IS NULL OR :searchTerm = '' OR (
                          LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR (
                              CASE
                                  WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                      AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                  ELSE FALSE
                              END
                          )
                      )
                  )
                  AND (
                      :dueByFilter = 'ALL'
                      OR (
                          :dueByFilter = 'NOT_ADDED' AND
                          NOT EXISTS (
                              SELECT 1 FROM aligner_journey aj WHERE aj.patient_id = p.id
                          )
                      )
                  )
                GROUP BY tp.id, p.id, tp.aligner_details_metadata
            )
            SELECT treatment_plan_id
            FROM filtered_patients
            WHERE
                (:caseType = 'ALL' OR
                 (:caseType = 'NEW' AND case_type = 'NEW') OR
                 (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                 (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                 (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                 (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
                 -- Exclude treatment plans with 0 pending aligners
                AND (total_aligners_count - processed_aligners_count) > 0
            ORDER BY
                CASE WHEN last_manufacturing_date IS NULL THEN 0 ELSE 1 END,
                last_manufacturing_date DESC NULLS LAST,
                patient_id
            LIMIT :limit OFFSET :offset
            """,
            nativeQuery = true)
    List<Long> findTreatmentPlanIdsForInternalCustomUsersByPaginationDesc(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("patientIds") List<Long> patientIds,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
                    WITH filtered_patients AS (
                        SELECT
                            tp.id as treatment_plan_id,
                            p.id as patient_id,
                            MAX(mb.updated_at) as last_manufacturing_date,
                            CASE
                                -- REFINEMENT: Patient has at least one ACTIVE and one DEACTIVATED treatment plan
                                WHEN EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'ACTIVE'
                                ) AND EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                                ) THEN 'REFINEMENT'

                                -- ARCHIVED: Patient has DEACTIVATED plans but NO ACTIVE or PAUSED plans
                                WHEN EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                                ) AND NOT EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status IN ('ACTIVE', 'PAUSED')
                                ) THEN 'ARCHIVED'

                                -- NEW: Patient has only ACTIVE/PAUSED plans (no DEACTIVATED)
                                ELSE 'NEW'
                            END as case_type,
                            -- Calculate total aligners from treatment plan metadata
                            CASE
                                WHEN tp.aligner_details_metadata IS NOT NULL THEN
                                    (
                                        COALESCE(
                                            (COALESCE(
                                                CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                                CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                            ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                            0
                                        ) +
                                        COALESCE(
                                            (COALESCE(
                                                CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                                CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                            ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                            0
                                        )
                                    )
                                ELSE 0
                            END as total_aligners_count,
                            -- Count processed aligners from manufacturing batches
                            COALESCE((
                                SELECT SUM(
                                    CASE
                                        WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                            THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                        ELSE 0
                                    END +
                                    CASE
                                        WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                            THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                        ELSE 0
                                    END
                                )
                                FROM manufacturing_batches mb2
                                WHERE mb2.treatment_plan_id = tp.id
                                AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                            ), 0) as processed_aligners_count
                        FROM patient_doctor_organization pdo
                        JOIN patient p ON p.id = pdo.patient_id
                        JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                        LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                        WHERE pdo.organization_id = :organizationId
                          AND p.patient_status != 'ARCHIVE'
                          AND p.id IN (:patientIds)
                          AND mb.is_archived != true
                          AND (
                              :searchTerm IS NULL OR :searchTerm = '' OR (
                                  LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR (
                                      CASE
                                          WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                              LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                              AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                          ELSE FALSE
                                      END
                                  )
                              )
                          )
                          AND (
                              :dueByFilter = 'ALL'
                              OR (
                                  :dueByFilter = 'NOT_ADDED' AND
                                  NOT EXISTS (
                                      SELECT 1 FROM aligner_journey aj WHERE aj.patient_id = p.id
                                  )
                              )
                          )
                        GROUP BY tp.id, p.id, tp.aligner_details_metadata
                    )
                    SELECT COUNT(treatment_plan_id)
                    FROM filtered_patients
                    WHERE
                        (:caseType = 'ALL' OR
                         (:caseType = 'NEW' AND case_type = 'NEW') OR
                         (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                         (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                         (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                         (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
                         -- Exclude treatment plans with 0 pending aligners
                        AND (total_aligners_count - processed_aligners_count) > 0
                    """,
            nativeQuery = true)
    Long countTreatmentPlanIdsForCustomInternalUser(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("patientIds") List<Long> patientIds);

    @Query(
            value =
                    """
                    WITH filtered_patients AS (
                        SELECT
                            tp.id as treatment_plan_id,
                            p.id as patient_id,
                            MAX(mb.updated_at) as last_manufacturing_date,
                            CASE
                                -- REFINEMENT: Patient has at least one ACTIVE and one DEACTIVATED treatment plan
                                WHEN EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'ACTIVE'
                                ) AND EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                                ) THEN 'REFINEMENT'

                                -- ARCHIVED: Patient has DEACTIVATED plans but NO ACTIVE or PAUSED plans
                                WHEN EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status = 'DEACTIVATED'
                                ) AND NOT EXISTS (
                                    SELECT 1 FROM treatment_plan WHERE patient_id = p.id AND status IN ('ACTIVE', 'PAUSED')
                                ) THEN 'ARCHIVED'

                                -- NEW: Patient has only ACTIVE/PAUSED plans (no DEACTIVATED)
                                ELSE 'NEW'
                            END as case_type,
                            -- Calculate total aligners from treatment plan metadata
                            CASE
                                WHEN tp.aligner_details_metadata IS NOT NULL THEN
                                    (
                                        COALESCE(
                                            (COALESCE(
                                                CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                                CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                            ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                            0
                                        ) +
                                        COALESCE(
                                            (COALESCE(
                                                CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                                CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                            ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                            0
                                        )
                                    )
                                ELSE 0
                            END as total_aligners_count,
                            -- Count processed aligners from manufacturing batches
                            COALESCE((
                                SELECT SUM(
                                    CASE
                                        WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                            THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                        ELSE 0
                                    END +
                                    CASE
                                        WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                            THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                        ELSE 0
                                    END
                                )
                                FROM manufacturing_batches mb2
                                WHERE mb2.treatment_plan_id = tp.id
                                AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                            ), 0) as processed_aligners_count
                        FROM patient_doctor_organization pdo
                        JOIN patient p ON p.id = pdo.patient_id
                        JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                        LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                        WHERE pdo.organization_id = :organizationId
                          AND p.patient_status != 'ARCHIVE'
                          AND mb.is_archived != true
                          AND (
                              :searchTerm IS NULL OR :searchTerm = '' OR (
                                  LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                                  OR (
                                      CASE
                                          WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                              LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                              AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                          ELSE FALSE
                                      END
                                  )
                              )
                          )
                          AND (
                              :dueByFilter = 'ALL'
                              OR (
                                  :dueByFilter = 'NOT_ADDED' AND
                                  NOT EXISTS (
                                      SELECT 1 FROM aligner_journey aj WHERE aj.patient_id = p.id
                                  )
                              )
                          )
                        GROUP BY tp.id, p.id, tp.aligner_details_metadata
                    )
                    SELECT COUNT(treatment_plan_id)
                    FROM filtered_patients
                    WHERE
                        (:caseType = 'ALL' OR
                         (:caseType = 'NEW' AND case_type = 'NEW') OR
                         (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                         (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                         (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                         (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
                         -- Exclude treatment plans with 0 pending aligners
                        AND (total_aligners_count - processed_aligners_count) > 0
                    """,
            nativeQuery = true)
    Long countTreatmentPlanIds(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm);

    @Query(
            value =
                    """
            WITH filtered_patients AS (
                SELECT
                    tp.id as treatment_plan_id,
                    pdo.patient_id,
                    MAX(mb.updated_at) as last_manufacturing_date,
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_active
                            WHERE tp_active.patient_id = p.id
                              AND tp_active.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_deactivated
                            WHERE tp_deactivated.patient_id = p.id
                              AND tp_deactivated.status = 'DEACTIVATED'
                        )
                        THEN 'REFINEMENT'
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_only_deactivated
                            WHERE tp_only_deactivated.patient_id = p.id
                              AND tp_only_deactivated.status = 'DEACTIVATED'
                        )
                        AND NOT EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_other
                            WHERE tp_other.patient_id = p.id
                              AND tp_other.status IN ('ACTIVE', 'PAUSED')
                        )
                        THEN 'ARCHIVED'
                        ELSE 'NEW'
                        END as case_type,
                        -- Calculate total aligners from treatment plan metadata
                        CASE
                            WHEN tp.aligner_details_metadata IS NOT NULL THEN
                                (
                                    COALESCE(
                                        (COALESCE(
                                            CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                            CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                        ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                        0
                                    ) +
                                    COALESCE(
                                        (COALESCE(
                                            CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                            CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                        ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                        0
                                    )
                                )
                            ELSE 0
                        END as total_aligners_count,
                        -- Calculate processed aligners from manufacturing batches
                        COALESCE((
                            SELECT SUM(
                                COALESCE(
                                    CASE
                                        WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                            THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                        ELSE 0
                                    END, 0
                                ) +
                                COALESCE(
                                    CASE
                                        WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                            THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                        ELSE 0
                                    END, 0
                                )
                            )
                            FROM manufacturing_batches mb2
                            WHERE mb2.treatment_plan_id = tp.id
                            AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                        ), 0) as processed_aligners_count
                FROM patient_doctor_organization pdo
                JOIN patient p ON p.id = pdo.patient_id
                JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                WHERE pdo.organization_id = :organizationId
                  AND mb.is_archived != true
                  AND p.patient_status != 'ARCHIVE'
                  -- MANDATORY: Aligner journey must exist for each patient
                  AND EXISTS (
                      SELECT 1 FROM aligner_journey aj
                      WHERE aj.patient_id = pdo.patient_id
                      AND aj.creation_status = 'DONE'
                      AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                  )
                  -- Search filter applied first
                  AND (
                      :searchTerm IS NULL OR (
                          LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR (
                              CASE
                                  WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                      AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                  ELSE FALSE
                              END
                          )
                      )
                  )
                  -- Due-by filter logic - only check if one of the 4 specific filters
                  AND (
                      :dueByFilter NOT IN ('OVERDUE', 'DUE_TODAY', 'DUE_THIS_WEEK', 'DUE_LATER')
                      OR (
                          :dueByFilter = 'OVERDUE' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date < CURRENT_DATE
                          )
                      )
                      OR (
                          :dueByFilter = 'DUE_TODAY' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date = CURRENT_DATE
                          )
                      )
                      OR (
                          :dueByFilter = 'DUE_THIS_WEEK' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
                          )
                      )
                      OR (
                          :dueByFilter = 'DUE_LATER' AND
                          EXISTS (
                              SELECT 1 FROM aligner_journey aj
                              JOIN aligner a ON aj.id = a.aligner_journey_id
                              JOIN treatment_plan tp ON tp.patient_id = aj.patient_id
                              JOIN (
                                  SELECT mb.treatment_plan_id,
                                         CASE
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                                  AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                                             WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                                             THEN mb.upper_aligner_end
                                             WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                                             THEN mb.lower_aligner_end
                                             ELSE 0
                                         END AS max_aligner_end
                                  FROM manufacturing_batches mb
                                  WHERE mb.id = (
                                      SELECT MAX(mb2.id)
                                      FROM manufacturing_batches mb2
                                      WHERE mb2.treatment_plan_id = mb.treatment_plan_id
                                  )
                              ) mb_latest ON mb_latest.treatment_plan_id = tp.id
                              WHERE aj.patient_id = pdo.patient_id
                              AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                              AND aj.creation_status = 'DONE'
                              AND aj.id = (
                                  SELECT MAX(aj2.id)
                                  FROM aligner_journey aj2
                                  WHERE aj2.patient_id = pdo.patient_id
                                  AND aj2.creation_status = 'DONE'
                                  AND aj2.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
                              )
                              AND a.sr_no = mb_latest.max_aligner_end
                              AND a.end_date > CURRENT_DATE + INTERVAL '7 days'
                          )
                      )
                  )
                GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
            )
            SELECT COUNT(*)
            FROM filtered_patients
            WHERE
                (:caseType = 'ALL' OR
                 (:caseType = 'NEW' AND case_type = 'NEW') OR
                 (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                 (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                 (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                 (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
            -- Exclude treatment plans with 0 pending aligners
            AND (total_aligners_count - processed_aligners_count) > 0
            """,
            nativeQuery = true)
    Long countPatientIdsByTreatmentPlanWithDueBy(
            @Param("organizationId") Long organizationId,
            @Param("dueByFilter") String dueByFilter,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm);

    @Query(
            value =
                    """
            WITH filtered_patients AS (
                SELECT
                    tp.id as treatment_plan_id,
                    pdo.patient_id,
                    MAX(mb.updated_at) as last_manufacturing_date,
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_active
                            WHERE tp_active.patient_id = p.id
                              AND tp_active.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_deactivated
                            WHERE tp_deactivated.patient_id = p.id
                              AND tp_deactivated.status = 'DEACTIVATED'
                        )
                        THEN 'REFINEMENT'
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_only_deactivated
                            WHERE tp_only_deactivated.patient_id = p.id
                              AND tp_only_deactivated.status = 'DEACTIVATED'
                        )
                        AND NOT EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_other
                            WHERE tp_other.patient_id = p.id
                              AND tp_other.status IN ('ACTIVE', 'PAUSED')
                        )
                        THEN 'ARCHIVED'
                        ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Calculate processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            COALESCE(
                                CASE
                                    WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                        THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            ) +
                            COALESCE(
                                CASE
                                    WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                        THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            )
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
                FROM patient_doctor_organization pdo
                JOIN patient p ON p.id = pdo.patient_id
                JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                WHERE pdo.organization_id = :organizationId
                      AND pdo.doctor_id = :doctorId
                      AND pdo.user_profile_id = :profileId
                      AND p.patient_status != 'ARCHIVE'
                      AND mb.is_archived != true
                  AND (
                      :searchTerm IS NULL OR :searchTerm = '' OR (
                          LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR (
                              CASE
                                  WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                      AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                  ELSE FALSE
                              END
                          )
                      )
                  )
                GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
            )
            SELECT treatment_plan_id
            FROM filtered_patients
            WHERE
                (:caseType = 'ALL' OR
                 (:caseType = 'NEW' AND case_type = 'NEW') OR
                 (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                 (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                 (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                 (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
                 -- Exclude treatment plans with 0 pending aligners
            AND (total_aligners_count - processed_aligners_count) > 0
            ORDER BY
                CASE WHEN last_manufacturing_date IS NULL THEN 1 ELSE 0 END,
                last_manufacturing_date ASC NULLS FIRST,
                patient_id
            LIMIT :limit OFFSET :offset
            """,
            nativeQuery = true)
    List<Long> findPatientIdsByDoctorIdWithActiveOrPausedOrDeactivatedTreatmentPlansAsc(
            @Param("organizationId") Long organizationId,
            @Param("doctorId") Long doctorId,
            @Param("profileId") Long profileId,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
            WITH filtered_patients AS (
                SELECT
                    tp.id as treatment_plan_id,
                    pdo.patient_id,
                    MAX(mb.updated_at) as last_manufacturing_date,
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_active
                            WHERE tp_active.patient_id = p.id
                              AND tp_active.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_deactivated
                            WHERE tp_deactivated.patient_id = p.id
                              AND tp_deactivated.status = 'DEACTIVATED'
                        )
                        THEN 'REFINEMENT'
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_only_deactivated
                            WHERE tp_only_deactivated.patient_id = p.id
                              AND tp_only_deactivated.status = 'DEACTIVATED'
                        )
                        AND NOT EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_other
                            WHERE tp_other.patient_id = p.id
                              AND tp_other.status IN ('ACTIVE', 'PAUSED')
                        )
                        THEN 'ARCHIVED'
                        ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Calculate processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            COALESCE(
                                CASE
                                    WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                        THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            ) +
                            COALESCE(
                                CASE
                                    WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                        THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            )
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
                FROM patient_doctor_organization pdo
                JOIN patient p ON p.id = pdo.patient_id
                JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                WHERE pdo.organization_id = :organizationId
                      AND pdo.doctor_id = :doctorId
                      AND pdo.user_profile_id = :profileId
                      AND p.patient_status != 'ARCHIVE'
                      AND mb.is_archived != true
                  AND (
                      :searchTerm IS NULL OR :searchTerm = '' OR (
                          LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR (
                              CASE
                                  WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                      AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                  ELSE FALSE
                              END
                          )
                      )
                  )
                GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
            )
            SELECT treatment_plan_id
            FROM filtered_patients
            WHERE
                (:caseType = 'ALL' OR
                 (:caseType = 'NEW' AND case_type = 'NEW') OR
                 (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                 (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                 (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                 (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
                -- Exclude treatment plans with 0 pending aligners
                AND (total_aligners_count - processed_aligners_count) > 0
            ORDER BY
                CASE WHEN last_manufacturing_date IS NULL THEN 0 ELSE 1 END,
                last_manufacturing_date DESC NULLS LAST,
                patient_id
            LIMIT :limit OFFSET :offset
            """,
            nativeQuery = true)
    List<Long> findPatientIdsByDoctorIdWithActiveOrPausedOrDeactivatedTreatmentPlansDesc(
            @Param("organizationId") Long organizationId,
            @Param("doctorId") Long doctorId,
            @Param("profileId") Long profileId,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
            WITH filtered_patients AS (
                SELECT
                    tp.id as treatment_plan_id,
                    pdo.patient_id,
                    MAX(mb.updated_at) as last_manufacturing_date,
                    CASE
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_active
                            WHERE tp_active.patient_id = p.id
                              AND tp_active.status = 'ACTIVE'
                        )
                        AND EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_deactivated
                            WHERE tp_deactivated.patient_id = p.id
                              AND tp_deactivated.status = 'DEACTIVATED'
                        )
                        THEN 'REFINEMENT'
                        WHEN EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_only_deactivated
                            WHERE tp_only_deactivated.patient_id = p.id
                              AND tp_only_deactivated.status = 'DEACTIVATED'
                        )
                        AND NOT EXISTS (
                            SELECT 1
                            FROM treatment_plan tp_other
                            WHERE tp_other.patient_id = p.id
                              AND tp_other.status IN ('ACTIVE', 'PAUSED')
                        )
                        THEN 'ARCHIVED'
                        ELSE 'NEW'
                    END as case_type,
                    -- Calculate total aligners from treatment plan metadata
                    CASE
                        WHEN tp.aligner_details_metadata IS NOT NULL THEN
                            (
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'upperJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                ) +
                                COALESCE(
                                    (COALESCE(
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'ends_with' AS INTEGER),
                                        CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER)
                                    ) - COALESCE(CAST(tp.aligner_details_metadata->'lowerJawDetails'->>'starts_with' AS INTEGER), 0) + 1),
                                    0
                                )
                            )
                        ELSE 0
                    END as total_aligners_count,
                    -- Calculate processed aligners from manufacturing batches
                    COALESCE((
                        SELECT SUM(
                            COALESCE(
                                CASE
                                    WHEN mb2.upper_aligner_start IS NOT NULL AND mb2.upper_aligner_end IS NOT NULL
                                        THEN (mb2.upper_aligner_end - mb2.upper_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            ) +
                            COALESCE(
                                CASE
                                    WHEN mb2.lower_aligner_start IS NOT NULL AND mb2.lower_aligner_end IS NOT NULL
                                        THEN (mb2.lower_aligner_end - mb2.lower_aligner_start + 1)
                                    ELSE 0
                                END, 0
                            )
                        )
                        FROM manufacturing_batches mb2
                        WHERE mb2.treatment_plan_id = tp.id
                        AND mb2.status IN ('DELIVERED', 'COMPLETED', 'SHIPPED', 'MANUFACTURING_STARTED')
                    ), 0) as processed_aligners_count
                FROM patient_doctor_organization pdo
                JOIN patient p ON p.id = pdo.patient_id
                JOIN treatment_plan tp ON tp.patient_id = p.id AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
                LEFT JOIN manufacturing_batches mb ON mb.patient_id = p.id
                WHERE pdo.organization_id = :organizationId
                      AND pdo.doctor_id = :doctorId
                      AND pdo.user_profile_id = :profileId
                      AND p.patient_status != 'ARCHIVE'
                      AND mb.is_archived != true
                  AND (
                      :searchTerm IS NULL OR :searchTerm = '' OR (
                          LOWER(p.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR LOWER(p.customer_mapped_id) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                          OR (
                              CASE
                                  WHEN POSITION(' ' IN :searchTerm) > 0 THEN
                                      LOWER(p.first_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 1), '%'))
                                      AND LOWER(p.last_name) LIKE LOWER(CONCAT('%', SPLIT_PART(:searchTerm, ' ', 2), '%'))
                                  ELSE FALSE
                              END
                          )
                      )
                  )
                GROUP BY tp.id, pdo.patient_id, p.id, tp.aligner_details_metadata
            )
            SELECT COUNT(*)
            FROM filtered_patients
            WHERE
                (:caseType = 'ALL' OR
                 (:caseType = 'NEW' AND case_type = 'NEW') OR
                 (:caseType = 'ARCHIVED' AND case_type = 'ARCHIVED') OR
                 (:caseType = 'REFINEMENT' AND case_type = 'REFINEMENT') OR
                 (:caseType = 'ARCHIVE_PLUS_ACTIVE' AND case_type IN ('ARCHIVED', 'NEW'))) OR
                 (:caseType = 'ACTIVE_PLUS_REFINEMENT' AND case_type IN ('REFINEMENT', 'NEW'))
                -- Exclude treatment plans with 0 pending aligners
                AND (total_aligners_count - processed_aligners_count) > 0
            """,
            nativeQuery = true)
    Long countPatientIdsByDoctorIdWithActiveOrPausedOrDeactivatedTreatmentPlans(
            @Param("organizationId") Long organizationId,
            @Param("doctorId") Long doctorId,
            @Param("profileId") Long profileId,
            @Param("caseType") String caseType,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
    SELECT pdo.patient.id
    FROM PatientDoctorOrganization pdo
    JOIN pdo.userProfile.roles role
    WHERE pdo.organization.id = :organizationId
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND role.name IN :roles
""")
    List<Long> findPatientIdsByOrganizationIdWithoutArchiveAndRoles(
            @Param("organizationId") Long organizationId, @Param("roles") List<String> roles);

    @Query(
            value =
                    """
    SELECT pdo.patient_id
    FROM patient_doctor_organization pdo
    LEFT JOIN patient p ON p.id = pdo.patient_id
    LEFT JOIN user_profile up ON pdo.user_profile_id = up.id
    LEFT JOIN user_profile_role upr ON up.id = upr.user_profile_id
    LEFT JOIN role r ON upr.role_id = r.id
    WHERE pdo.organization_id = :organizationId
      AND p.patient_status != 'ARCHIVE'
      AND r.name IN :roleName
""",
            nativeQuery = true)
    List<Long> findPatientIdsByOrganizationIdAndRoleIdWithoutArchive(
            @Param("organizationId") Long organizationId, @Param("roleName") List<String> roleName);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id FROM PatientDoctorOrganization pdo
    JOIN Tracking t ON t.patientId = pdo.patient.id
    WHERE pdo.organization.id = :organizationId
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND t.trackingType = :trackingType
    AND (:practiceLocationIds IS NULL OR pdo.patient.practiceLocationId IN :practiceLocationIds)
""")
    List<Long> findPatientIdsByOrganizationIdAndTrackingType(
            @Param("organizationId") Long organizationId,
            @Param("trackingType") TrackingType trackingType,
            @Param("practiceLocationIds") @Nullable List<Long> practiceLocationIds);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id FROM PatientDoctorOrganization pdo
    JOIN Tracking t ON t.patientId = pdo.patient.id
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND t.trackingType = :trackingType
    AND pdo.patient.id IN :patientIds
    AND (:practiceLocationIds IS NULL OR pdo.patient.practiceLocationId IN :practiceLocationIds)
""")
    List<Long> findPatientIdsByPatientIdsAndTrackingType(
            @Param("patientIds") List<Long> patientIds,
            @Param("trackingType") TrackingType trackingType,
            @Param("practiceLocationIds") @Nullable List<Long> practiceLocationIds);

    @Query(
            """
    SELECT pdo.patient.id FROM PatientDoctorOrganization pdo
    WHERE pdo.doctor.id = :doctorId
    AND pdo.organization.id = :organizationId
    AND pdo.userProfile.id = :profileId
    AND pdo.patient.patientStatus != 'ARCHIVE'
""")
    List<Long> findPatientIdsByDoctorOrgAndProfileWithoutArchive(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id FROM PatientDoctorOrganization pdo
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
    LEFT JOIN Invitation i ON pid.invitation.id = i.id
    WHERE pdo.organization.id = :organizationId
    AND pdo.userProfile.id != :excludedProfileId
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND (:appInviteStatus IS NULL OR
        (:appInviteStatus = 'ALL') OR
        (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
        (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
        (:appInviteStatus = 'NOT_CONNECTED' AND (i.status IS NULL OR (i.status = 0 AND i.isInvitationSent = false) OR (i.status NOT IN (0, 5)))))
    AND NOT EXISTS (
        SELECT 1 FROM Order o
        WHERE o.patient.id = pdo.patient.id
        AND o.status NOT IN ('DRAFT')
    )
    """)
    List<Long> findAssignedPracticePatient(
            @Param("organizationId") Long organizationId,
            @Param("excludedProfileId") Long excludedProfileId,
            @Param("appInviteStatus") String appInviteStatus);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id FROM PatientDoctorOrganization pdo
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
    LEFT JOIN Invitation i ON pid.invitation.id = i.id
    WHERE pdo.doctor.id = :doctorId
    AND pdo.organization.id = :organizationId
    AND pdo.userProfile.id = :profileId
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
    AND (:appInviteStatus IS NULL OR
        (:appInviteStatus = 'ALL') OR
        (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
        (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
        (:appInviteStatus = 'NOT_CONNECTED' AND (i.status IS NULL OR (i.status = 0 AND i.isInvitationSent = false) OR (i.status NOT IN (0, 5)))))
    """)
    List<Long> getPatientIdsForPractice(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id FROM PatientDoctorOrganization pdo
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
    LEFT JOIN Invitation i ON pid.invitation.id = i.id
    WHERE pdo.userProfile.id IN :profileIds
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND (:appInviteStatus IS NULL OR
        (:appInviteStatus = 'ALL') OR
        (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
        (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
        (:appInviteStatus = 'NOT_CONNECTED' AND (i.status IS NULL OR (i.status = 0 AND i.isInvitationSent = false) OR (i.status NOT IN (0, 5)))))
    AND NOT EXISTS (
        SELECT 1 FROM Order o
        WHERE o.patient.id = pdo.patient.id
        AND o.status NOT IN ('DRAFT'))
    """)
    List<Long> getPatientByPracticeId(
            @Param("profileIds") List<Long> profileIds, @Param("appInviteStatus") String appInviteStatus);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM Order o
                WHERE o.patient.id = pdo.patient.id
                AND o.status NOT IN ('DRAFT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM TreatmentPlan tp
                WHERE tp.patient.id = pdo.patient.id
                AND tp.status IN ('ACTIVE', 'PAUSED','DEACTIVATED','COMPLETE')
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> assessmentPatientIdsForOrganization(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM Order o
                WHERE o.patient.id = pdo.patient.id
                AND o.status NOT IN ('DRAFT', 'COMPLETED')
            )
            AND NOT EXISTS (
                SELECT 1 FROM TreatmentPlan tp
                WHERE tp.patient.id = pdo.patient.id
                AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED','COMPLETE')
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> assessmentPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM TreatmentPlan tp
                WHERE tp.patient.id = pdo.patient.id
                AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            )
            AND EXISTS (
                SELECT 1 FROM Order o
                WHERE o.patient.id = pdo.patient.id
                AND o.status NOT IN ('DRAFT', 'COMPLETED')
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> planningPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query("SELECT DISTINCT pdo.patient.id, pdo.updatedAt " + "FROM PatientDoctorOrganization pdo "
            + "LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id "
            + "LEFT JOIN Invitation i ON pid.invitation.id = i.id "
            + "WHERE pdo.doctor.id = :doctorId "
            + "AND pdo.organization.id = :organizationId "
            + "AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId) "
            + "AND pdo.userProfile.id = :profileId "
            + "AND pdo.patient.patientStatus != 'ARCHIVE' "
            + "AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId) "
            + "AND ("
            + "    :appInviteStatus IS NULL OR "
            + "    :appInviteStatus = 'ALL' OR "
            + "    (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR "
            + "    (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR "
            + "    (:appInviteStatus = 'NOT_CONNECTED' AND ("
            + "        i.status IS NULL OR "
            + "        (i.status = 0 AND i.isInvitationSent = false) OR "
            + "        (i.status NOT IN (0, 5))"
            + "    ))"
            + ") "
            + "AND ("
            + "    :search IS NULL OR :search = '' OR ("
            + "        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "        LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "        LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR "
            + "        ("
            + "            LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND "
            + "            LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))"
            + "        )"
            + "    )"
            + ") "
            + "AND ("
            + "    :patientType IS NULL OR "
            + "    :patientType = 'ALL' OR "
            + "    :patientType = 'NEW_PATIENT' OR "
            + "    (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')"
            + ") "
            + "AND NOT EXISTS ("
            + "    SELECT 1 FROM TreatmentPlan tp "
            + "    WHERE tp.patient.id = pdo.patient.id "
            + "    AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')"
            + ") "
            + "AND EXISTS ("
            + "    SELECT 1 FROM Order o "
            + "    WHERE o.patient.id = pdo.patient.id "
            + "    AND o.status NOT IN ('DRAFT', 'COMPLETED')"
            + ") "
            + "ORDER BY pdo.updatedAt DESC")
    List<Long> planningPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Tracking t ON t.treatmentPlan.id = tp.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND tp.status IN ('ACTIVE', 'PAUSED')
            AND t.id IS NULL
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM ManufacturingBatch mb
                WHERE mb.treatmentPlan.id = tp.id
                AND mb.status IN ('SHIPPED', 'DELIVERED')
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> manufacturingPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Tracking t ON t.treatmentPlan.id = tp.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND tp.status IN ('ACTIVE', 'PAUSED')
            AND t.id IS NULL
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM ManufacturingBatch mb
                WHERE mb.treatmentPlan.id = tp.id
                AND mb.status IN ('SHIPPED', 'DELIVERED')
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> manufacturingPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN ManufacturingBatch mb ON mb.treatmentPlan.id = tp.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND tp.status IN ('ACTIVE', 'PAUSED')
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND EXISTS (
                SELECT 1 FROM ManufacturingBatch mb2
                WHERE mb2.treatmentPlan.id = tp.id
                AND mb2.status = 'SHIPPED'
            )
            AND NOT EXISTS (
                SELECT 1 FROM ManufacturingBatch mb3
                WHERE mb3.treatmentPlan.id = tp.id
                AND mb3.status IN ('DELIVERED')
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM ManufacturingBatch mb4
                WHERE mb4.treatmentPlan.id = tp.id
                AND mb4.status NOT IN ('SHIPPED', 'DELIVERED')
            )
            AND NOT EXISTS (
                SELECT 1 FROM Tracking t2
                 WHERE t2.treatmentPlan.patient.id = pdo.patient.id
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> transitPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN ManufacturingBatch mb ON mb.treatmentPlan.id = tp.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND tp.status IN ('ACTIVE', 'PAUSED')
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND EXISTS (
                SELECT 1 FROM ManufacturingBatch mb2
                WHERE mb2.treatmentPlan.id = tp.id
                AND mb2.status = 'SHIPPED'
            )
            AND NOT EXISTS (
                SELECT 1 FROM ManufacturingBatch mb3
                WHERE mb3.treatmentPlan.id = tp.id
                AND mb3.status IN ('DELIVERED')
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM ManufacturingBatch mb4
                WHERE mb4.treatmentPlan.id = tp.id
                AND mb4.status NOT IN ('SHIPPED', 'DELIVERED')
            )
            AND NOT EXISTS (
                SELECT 1 FROM Tracking t2
                WHERE t2.treatmentPlan.patient.id = pdo.patient.id
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> transitPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Tracking t ON t.treatmentPlan.id = tp.id
            LEFT JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            LEFT JOIN ManufacturingBatch mb ON mb.treatmentPlan.id = tp.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'ACTIVE'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                (t.id IS NOT NULL AND aj.id IS NOT NULL AND aj.doctorTreatmentStartDate > CURRENT_DATE)
                OR
                (
                    mb.status = 'DELIVERED'
                    AND NOT EXISTS (
                        SELECT 1 FROM Tracking t2
                        WHERE t2.treatmentPlan.patient.id = pdo.patient.id
                    )
                )
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> startingSoonPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Tracking t ON t.treatmentPlan.id = tp.id
            LEFT JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            LEFT JOIN ManufacturingBatch mb ON mb.treatmentPlan.id = tp.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'ACTIVE'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                (t.id IS NOT NULL AND aj.id IS NOT NULL AND aj.doctorTreatmentStartDate > CURRENT_DATE)
                OR
                (
                    mb.status = 'DELIVERED'
                    AND NOT EXISTS (
                        SELECT 1 FROM Tracking t2
                        WHERE t2.treatmentPlan.patient.id = pdo.patient.id
                    )
                )
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> startingSoonPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.organization.id = :organizationId
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'PAUSED'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> pausedPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'PAUSED'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> pausedPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'ACTIVE'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            )
            AND aj.doctorTreatmentStartDate <= CURRENT_DATE
            GROUP BY pdo.patient.id, pdo.updatedAt
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> ongoingPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'COMPLETE'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            )
            AND aj.doctorTreatmentStartDate <= CURRENT_DATE
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> completedPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'COMPLETE'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND aj.doctorTreatmentStartDate <= CURRENT_DATE
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> completedPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND tp.status = 'ACTIVE'
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND aj.doctorTreatmentStartDate <= CURRENT_DATE
            GROUP BY pdo.patient.id, pdo.updatedAt
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> ongoingPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND EXISTS (
                SELECT 1 FROM TreatmentPlan tp
                WHERE tp.patient.id = pdo.patient.id
                AND (tp.status = 'DEACTIVATED' OR tp.status = 'ARCHIVED')
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            GROUP BY pdo.patient.id, pdo.updatedAt
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> refinementPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id, pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND (
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp1
                    WHERE tp1.patient.id = pdo.patient.id
                    AND tp1.status = 'PAUSED'
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp2
                    WHERE tp2.patient.id = pdo.patient.id
                    AND tp2.status = 'COMPLETE'
                )
                OR
                (
                    NOT EXISTS (
                        SELECT 1 FROM TreatmentPlan tp3
                        WHERE tp3.patient.id = pdo.patient.id
                        AND tp3.status IN ('ACTIVE', 'PAUSED')
                    )
                    AND EXISTS (
                        SELECT 1 FROM TreatmentPlan tp4
                        WHERE tp4.patient.id = pdo.patient.id
                        AND tp4.status = 'DEACTIVATED'
                    )
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp5
                    LEFT JOIN Tracking t5 ON t5.treatmentPlan.id = tp5.id
                    LEFT JOIN AlignerJourney aj5 ON t5.alignerJourney.id = aj5.id
                    WHERE tp5.patient.id = pdo.patient.id
                    AND tp5.status = 'ACTIVE'
                    AND t5.id IS NOT NULL
                    AND aj5.id IS NOT NULL
                    AND aj5.doctorTreatmentStartDate > CURRENT_DATE
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp6
                    LEFT JOIN ManufacturingBatch mb6 ON mb6.treatmentPlan.id = tp6.id
                    WHERE tp6.patient.id = pdo.patient.id
                    AND tp6.status = 'ACTIVE'
                    AND mb6.status = 'DELIVERED'
                    AND NOT EXISTS (
                        SELECT 1 FROM Tracking t6
                        WHERE t6.treatmentPlan.patient.id = pdo.patient.id
                    )
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp7
                    INNER JOIN Tracking t7 ON t7.treatmentPlan.id = tp7.id
                    INNER JOIN AlignerJourney aj7 ON t7.alignerJourney.id = aj7.id
                    WHERE tp7.patient.id = pdo.patient.id
                    AND tp7.status = 'ACTIVE'
                    AND aj7.doctorTreatmentStartDate <= CURRENT_DATE
                )
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> combinedActivePatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id, pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND (
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp1
                    WHERE tp1.patient.id = pdo.patient.id
                    AND tp1.status = 'PAUSED'
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp2
                    WHERE tp2.patient.id = pdo.patient.id
                    AND tp2.status = 'COMPLETE'
                )
                OR
                (
                    NOT EXISTS (
                        SELECT 1 FROM TreatmentPlan tp3
                        WHERE tp3.patient.id = pdo.patient.id
                        AND tp3.status IN ('ACTIVE', 'PAUSED')
                    )
                    AND EXISTS (
                        SELECT 1 FROM TreatmentPlan tp4
                        WHERE tp4.patient.id = pdo.patient.id
                        AND tp4.status = 'DEACTIVATED'
                    )
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp5
                    LEFT JOIN Tracking t5 ON t5.treatmentPlan.id = tp5.id
                    LEFT JOIN AlignerJourney aj5 ON t5.alignerJourney.id = aj5.id
                    WHERE tp5.patient.id = pdo.patient.id
                    AND tp5.status = 'ACTIVE'
                    AND t5.id IS NOT NULL
                    AND aj5.id IS NOT NULL
                    AND aj5.doctorTreatmentStartDate > CURRENT_DATE
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp6
                    LEFT JOIN ManufacturingBatch mb6 ON mb6.treatmentPlan.id = tp6.id
                    WHERE tp6.patient.id = pdo.patient.id
                    AND tp6.status = 'ACTIVE'
                    AND mb6.status = 'DELIVERED'
                    AND NOT EXISTS (
                        SELECT 1 FROM Tracking t6
                        WHERE t6.treatmentPlan.patient.id = pdo.patient.id
                    )
                )
                OR
                EXISTS (
                    SELECT 1 FROM TreatmentPlan tp7
                    INNER JOIN Tracking t7 ON t7.treatmentPlan.id = tp7.id
                    INNER JOIN AlignerJourney aj7 ON t7.alignerJourney.id = aj7.id
                    WHERE tp7.patient.id = pdo.patient.id
                    AND tp7.status = 'ACTIVE'
                    AND aj7.doctorTreatmentStartDate <= CURRENT_DATE
                )
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> combinedActivePatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id, pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            AND EXISTS (
                SELECT 1 FROM TreatmentPlan tp
                WHERE tp.patient.id = pdo.patient.id
                AND (tp.status = 'DEACTIVATED' OR tp.status = 'ARCHIVED')
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> refinementPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id, pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (:customerMappedId IS NULL OR pdo.patient.customerMappedId = :customerMappedId)
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND EXISTS (
                SELECT 1 FROM pdo.userProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
                    )
                )
            )
            ORDER BY pdo.updatedAt DESC
        """)
    List<Long> allPatientIdsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("customerMappedId") String customerMappedId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id
            FROM PatientDoctorOrganization pdo
            LEFT JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Order o ON o.patient.id = pdo.patient.id
            LEFT JOIN ManufacturingBatch mb ON mb.patient.id = pdo.patient.id
            WHERE pdo.patient.patientStatus != 'ARCHIVE'
                AND (tp.id IS NOT NULL OR o.id IS NOT NULL OR mb.id IS NOT NULL)
                AND (
                    :search IS NULL OR :search = '' OR (
                        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(CONCAT(pdo.patient.firstName, ' ', pdo.patient.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                    )
                )
                AND (
                    :profileId IS NULL
                    OR (tp.id IS NOT NULL AND tp.outsourcedTo.id = :profileId AND tp.doctorId = :doctorId)
                    OR (o.id IS NOT NULL AND o.status != 'DRAFT' AND (
                        (o.ownerProfile.id = :profileId AND o.targetProfile.id = :customerId) OR
                        (o.targetProfile.id = :profileId AND o.ownerProfile.id = :customerId)
                    ))
                    OR (mb.id IS NOT NULL AND mb.outsourcedTo.id = :profileId AND mb.manufacturingTargetProfile.id = :customerId OR mb.manufacturingOwnerProfile.id = :customerId)
                )
            """)
    List<Long> getCustomerPatientList(
            @Param("customerId") Long customerId,
            @Param("profileId") Long profileId,
            @Param("search") String search,
            @Param("doctorId") Long doctorId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Order o ON o.patient.id = pdo.patient.id
            WHERE pdo.patient.patientStatus != 'ARCHIVE'
                AND (tp.id IS NOT NULL OR o.id IS NOT NULL)
                AND (
                    :profileId IS NULL
                    OR (tp.id IS NOT NULL AND tp.outsourcedTo.id = :profileId AND tp.doctorId = :doctorId)
                    OR (o.id IS NOT NULL AND o.status != 'DRAFT' AND (
                        (o.ownerProfile.id = :profileId AND o.targetProfile.id = :customerId) OR
                        (o.targetProfile.id = :profileId AND o.ownerProfile.id = :customerId)
                    ))
                )
            """)
    Long getCustomerPatientCount(
            @Param("customerId") Long customerId, @Param("profileId") Long profileId, @Param("doctorId") Long doctorId);

    @Query(
            """
    SELECT DISTINCT o.patient.id, o.updatedAt
    FROM Order o
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = o.patient.id
    LEFT JOIN Invitation i ON pid.invitation.id = i.id
    WHERE o.ownerProfile.id = :targetProfileId
    AND o.patient.patientStatus != 'ARCHIVE'
    AND EXISTS (
        SELECT 1 FROM o.ownerProfile.roles r
        WHERE r.name IN :roles
    )
    AND (
        :appInviteStatus IS NULL OR
        :appInviteStatus = 'ALL' OR
        (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
        (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
        (:appInviteStatus = 'NOT_CONNECTED' AND (
            i.status IS NULL OR
            (i.status = 0 AND i.isInvitationSent = false) OR
            (i.status NOT IN (0, 5))
        ))
    )
    AND (
        :patientType IS NULL OR
        :patientType = 'ALL' OR
        :patientType = 'NEW_PATIENT' OR
        (:patientType = 'EXISTING_PATIENT' AND o.patient.patientType = 'EXISTING_PATIENT')
    )
    AND (
        :search IS NULL OR :search = '' OR (
            LOWER(o.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
            (
                LOWER(o.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                LOWER(o.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
            )
        )
    )
    ORDER BY o.updatedAt DESC
    """)
    List<Long> allPatientIdOfCustomerPatientForOrg(
            @Param("targetProfileId") Long targetProfileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
    SELECT DISTINCT o.patient.id,o.updatedAt
    FROM Order o
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = o.patient.id
    LEFT JOIN Invitation i ON pid.invitation.id = i.id
    WHERE o.targetProfile.id = :targetProfileId
    AND o.patient.patientStatus != 'ARCHIVE'
    AND EXISTS (
        SELECT 1 FROM o.ownerProfile.roles r
        WHERE r.name IN :roles
    )
    AND (
        :appInviteStatus IS NULL OR
        :appInviteStatus = 'ALL' OR
        (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
        (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
        (:appInviteStatus = 'NOT_CONNECTED' AND (
            i.status IS NULL OR
            (i.status = 0 AND i.isInvitationSent = false) OR
            (i.status NOT IN (0, 5))
        ))
    )
    AND (
        :patientType IS NULL OR
        :patientType = 'ALL' OR
        :patientType = 'NEW_PATIENT' OR
        (:patientType = 'EXISTING_PATIENT' AND o.patient.patientType = 'EXISTING_PATIENT')
    )
    AND (
        :search IS NULL OR :search = '' OR (
            LOWER(o.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
            LOWER(o.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
            (
                LOWER(o.patient.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 1), '%')) AND
                LOWER(o.patient.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :search, ' ', 2), '%'))
            )
        )
    )
    ORDER BY o.patient.updatedAt DESC
    """)
    List<Long> allPatientIdOfAllCustomerPatientForOrg(
            @Param("targetProfileId") Long targetProfileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT DISTINCT pdo.patient.id,pdo.updatedAt
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND (:practiceLocationId IS NULL OR pdo.patient.practiceLocationId = :practiceLocationId)
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND (
                :appInviteStatus IS NULL OR
                :appInviteStatus = 'ALL' OR
                (:appInviteStatus = 'CONNECTED' AND i.status = 5) OR
                (:appInviteStatus = 'PENDING' AND i.status = 0 AND i.isInvitationSent = true) OR
                (:appInviteStatus = 'NOT_CONNECTED' AND (
                    i.status IS NULL OR
                    (i.status = 0 AND i.isInvitationSent = false) OR
                    (i.status NOT IN (0, 5))
                ))
            )
            AND (
                :patientType IS NULL OR
                :patientType = 'ALL' OR
                :patientType = 'NEW_PATIENT' OR
                (:patientType = 'EXISTING_PATIENT' AND pdo.patient.patientType = 'EXISTING_PATIENT')
            )
            AND (
                :search IS NULL OR :search = '' OR (
                    LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(CONCAT(pdo.patient.firstName, ' ', pdo.patient.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            )
            ORDER BY pdo.updatedAt DESC
            """)
    List<Long> allPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType);

    @Query(
            value =
                    """
    SELECT
        p.id AS patientId,
        CASE
            -- REFINEMENT: Has deactivated treatment plan, no active/paused plans
            WHEN EXISTS (
                SELECT 1 FROM treatment_plan tp
                WHERE tp.patient_id = p.id
                AND (tp.status = 'DEACTIVATED' OR tp.status = 'ARCHIVED')
            )
            THEN 'REFINEMENT'

            -- ASSESSMENT: No active/paused treatment plans AND no non-draft orders
            WHEN NOT EXISTS (
                SELECT 1 FROM treatment_plan tp
                WHERE tp.patient_id = p.id
                AND tp.status IN ('ACTIVE', 'PAUSED','COMPLETE')
            )
            AND NOT EXISTS (
                SELECT 1 FROM orders o
                WHERE o.patient_id = p.id
                AND o.status != 'DRAFT'
            )
            THEN 'ASSESSMENT'

            -- IN_PLANNING: Has non-draft, non-completed orders AND no active/paused/deactivated treatment plans
            WHEN NOT EXISTS (
                SELECT 1 FROM treatment_plan tp
                WHERE tp.patient_id = p.id
                AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            )
            AND EXISTS (
                SELECT 1 FROM orders o
                WHERE o.patient_id = p.id
                AND o.status NOT IN ('DRAFT', 'COMPLETED')
            )
            THEN 'IN_PLANNING'

            -- MANUFACTURING: Has active/paused treatment plan, no tracking, no shipped/delivered batches
            WHEN EXISTS (
                SELECT 1 FROM treatment_plan tp
                WHERE tp.patient_id = p.id
                AND tp.status IN ('ACTIVE', 'PAUSED')
            )
            AND NOT EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN tracking t ON t.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
            )
            AND NOT EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN manufacturing_batches mb ON mb.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
                AND mb.status IN ('SHIPPED', 'DELIVERED')
                AND tp.status IN ('ACTIVE', 'PAUSED')
            )
            THEN 'MANUFACTURING'

            -- IN_TRANSIT: Has shipped batches but no delivered batches
            WHEN EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN manufacturing_batches mb ON mb.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
                AND tp.status IN ('ACTIVE', 'PAUSED')
                AND mb.status = 'SHIPPED'
            )
            AND NOT EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN manufacturing_batches mb ON mb.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
                AND mb.status = 'DELIVERED'
            )
            THEN 'IN_TRANSIT'

            -- STARTING_SOON: Has active treatment plan with tracking and future start date
            -- OR has active treatment plan with delivered manufacturing batches
            WHEN EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN tracking t ON t.treatment_plan_id = tp.id
                JOIN aligner_journey aj ON t.aligner_journey_id = aj.id
                WHERE tp.patient_id = p.id
                AND tp.status = 'ACTIVE'
                AND aj.doctor_treatment_start_date > CURRENT_DATE
            )
            OR EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN manufacturing_batches mb ON mb.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
                AND tp.status = 'ACTIVE'
                AND mb.status = 'DELIVERED'
            )
            AND NOT EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN tracking t ON t.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
            )
            THEN 'STARTING_SOON'

            -- ONGOING: Has active treatment plan with tracking and current/past start date
            WHEN EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN tracking t ON t.treatment_plan_id = tp.id
                JOIN aligner_journey aj ON t.aligner_journey_id = aj.id
                WHERE tp.patient_id = p.id
                AND tp.status = 'ACTIVE'
                AND aj.doctor_treatment_start_date <= CURRENT_DATE
            )
            THEN 'ONGOING'

            -- PAUSED: Has paused treatment plan with tracking
            WHEN EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN tracking t ON t.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
                AND tp.status = 'PAUSED'
            )
            THEN 'PAUSED'

             -- PAUSED: Has paused treatment plan with tracking
            WHEN EXISTS (
                SELECT 1 FROM treatment_plan tp
                JOIN tracking t ON t.treatment_plan_id = tp.id
                WHERE tp.patient_id = p.id
                AND tp.status = 'COMPLETE'
            )
            THEN 'COMPLETE'

            -- DEFAULT case
            ELSE 'UNKNOWN'
        END AS currentStage
    FROM patient p
    WHERE p.id IN (:patientIds)
    ORDER BY p.id
    """,
            nativeQuery = true)
    List<PatientStageResult> getAllPatientsWithStages(@Param("patientIds") List<Long> patientIds);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id FROM PatientDoctorOrganization pdo
    JOIN Tracking t ON t.patientId = pdo.patient.id
    WHERE pdo.doctor.id = :doctorId
    AND pdo.organization.id = :organizationId
    AND pdo.userProfile.id = :profileId
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND t.trackingType = :trackingType
    AND (:#{#practiceLocationIds == null || #practiceLocationIds.isEmpty()} = true
         OR pdo.patient.practiceLocationId IN :practiceLocationIds)
""")
    List<Long> findPatientIdsByDoctorOrgProfileAndTrackingType(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("trackingType") TrackingType trackingType,
            @Param("practiceLocationIds") @Nullable List<Long> practiceLocationIds);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id FROM PatientDoctorOrganization pdo
    JOIN Tracking t ON t.patientId = pdo.patient.id
    WHERE pdo.organization.id = :organizationId
    AND pdo.userProfile.id IN :profileIds
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND t.trackingType = :trackingType
    AND (:practiceLocationIds IS NULL OR pdo.patient.practiceLocationId IN :practiceLocationIds)
""")
    List<Long> findPatientIdsByOrgProfilesAndTrackingTypeWithoutArchive(
            @Param("organizationId") Long organizationId,
            @Param("profileIds") List<Long> profileIds,
            @Param("trackingType") TrackingType trackingType,
            @Param("practiceLocationIds") @Nullable List<Long> practiceLocationIds);

    @Query("SELECT pdo.patient.id FROM PatientDoctorOrganization pdo " + "WHERE pdo.doctor.id = :doctorId "
            + "AND pdo.organization.id = :organizationId "
            + "AND pdo.userProfile.id = :profileId "
            + "AND pdo.patient.patientStatus = :patientStatus")
    List<Long> findPatientIdsByDoctorOrgAndProfileWithStatus(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("patientStatus") PatientStatus patientStatus);

    @Query("SELECT pdo.patient.id FROM PatientDoctorOrganization pdo "
            + "WHERE pdo.userProfile.id = :profileId "
            + "AND pdo.patient.patientStatus = :patientStatus")
    List<Long> findPatientIdsByCustomerProfile(
            @Param("profileId") Long profileId, @Param("patientStatus") PatientStatus patientStatus);

    @Query(
            value =
                    """
    SELECT pdo.patient_id
    FROM patient_doctor_organization pdo
    JOIN user_profile up ON up.id = pdo.user_profile_id
    JOIN user_profile oup ON oup.id = pdo.org_user_profile_id
    JOIN patient p ON p.id = pdo.patient_id
    WHERE pdo.user_profile_id = :profileId
    AND oup.organization_id = :organizationId
    """,
            nativeQuery = true)
    List<Long> findPatientIdsByCustomerProfileAndOrganization(
            @Param("profileId") Long profileId, @Param("organizationId") Long organizationId);

    @Query("SELECT " + "pdo.patient.id AS patientId, "
            + "pdo.patient.firstName AS firstName, "
            + "pdo.patient.lastName AS lastName, "
            + "pdo.patient.mobileNo AS mobileNumber, "
            + "pdo.patient.city AS city, "
            + "pdo.patient.profilePictureUrl AS profilePictureUrl, "
            + "pdo.patient.profileImage.id AS profilePictureId, "
            + "pdo.patient.UUID AS uuid, "
            + "pdo.patient.email AS email, "
            + "(SELECT MAX(aj.id) FROM AlignerJourney aj "
            + "WHERE aj.patient.id = pdo.patient.id) AS alignerJourneyId "
            + "FROM PatientDoctorOrganization pdo "
            + "WHERE pdo.doctor.id = :doctorId "
            + "AND pdo.organization.id = :organizationId "
            + "AND pdo.userProfile.id = :profileId")
    List<PatientSummary> findPatientsSummeryByDoctorOrgAndProfile(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);

    @Query(
            """
        SELECT CASE WHEN COUNT(pdo) > 0 THEN true ELSE false END
        FROM PatientDoctorOrganization pdo
        WHERE pdo.doctor.id = :doctorId
          AND pdo.patient.id = :patientId
          AND pdo.addedByUserProfile.id = :userProfileId
          AND pdo.organization.id = :organizationId
    """)
    boolean existsByDoctorIdAndPatientIdAndUserProfileIdAndOrganizationId(
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("userProfileId") Long userProfileId,
            @Param("organizationId") Long organizationId);

    PatientDoctorOrganization findByPatientIdAndDoctorId(Long patientId, Long doctorId);

    List<PatientDoctorOrganization> findByDoctorIdAndOrganizationId(Long doctorId, Long organizationId);

    List<PatientDoctorOrganization> findByPatientId(Long patientId);

    @Modifying
    @Query("DELETE FROM PatientDoctorOrganization pdo WHERE pdo.patient.id = :patientId")
    void deleteAllByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
SELECT pdo FROM PatientDoctorOrganization pdo
LEFT JOIN FETCH pdo.userProfile up
LEFT JOIN FETCH pdo.addedByUserProfile aup
LEFT JOIN FETCH pdo.orgUserProfile orup
LEFT JOIN FETCH orup.user oaupu
LEFT JOIN FETCH orup.doctor orupd
LEFT JOIN FETCH aup.user aupu
LEFT JOIN FETCH up.user u
LEFT JOIN FETCH up.roles iup
LEFT JOIN FETCH up.doctor
LEFT JOIN FETCH up.inviterProfile inv
LEFT JOIN FETCH inv.roles irs
LEFT JOIN FETCH inv.doctor
LEFT JOIN FETCH inv.user
LEFT JOIN FETCH pdo.patient
WHERE pdo.patient.id = :patientId
""")
    PatientDoctorOrganization findByPatient(Long patientId);

    @Query("SELECT p FROM PatientDoctorOrganization p " + "JOIN FETCH p.doctor "
            + "JOIN FETCH p.userProfile "
            + "JOIN FETCH p.organization "
            + "WHERE p.patient.id = :patientId AND p.doctor.id = :doctorId")
    Optional<PatientDoctorOrganization> findWithAssociations(
            @Param("patientId") Long patientId, @Param("doctorId") Long doctorId);

    @Query(
            """
    SELECT p FROM PatientDoctorOrganization p
    JOIN FETCH p.doctor
    JOIN FETCH p.userProfile up
    JOIN FETCH p.organization
    JOIN FETCH up.user
    WHERE p.patient.id IN :patientIds AND p.doctor.id = :doctorId
""")
    List<PatientDoctorOrganization> findWithAssociationsByPatientIds(
            @Param("patientIds") Collection<Long> patientIds, @Param("doctorId") Long doctorId);

    @Query("SELECT pdo.userProfile.id FROM PatientDoctorOrganization pdo " + "WHERE pdo.patient.id = :patientId")
    Optional<Long> findUserProfileIdByPatientId(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
                            SELECT
                                (
                                    SELECT MIN(r.name)
                                    FROM user_profile_role upr
                                    JOIN role r ON upr.role_id = r.id
                                    WHERE upr.user_profile_id = pdo.user_profile_id
                                ) AS role_name
                            FROM patient_doctor_organization pdo
                            WHERE pdo.patient_id = :patientId
            """,
            nativeQuery = true)
    String findRoleIdByPatientId(@Param("patientId") Long patientId);

    @Query(
            nativeQuery = true,
            value =
                    """
        WITH organization_patients AS (
            SELECT DISTINCT pdo.patient_id
            FROM patient_doctor_organization pdo
            JOIN patient p ON pdo.patient_id = p.id
            WHERE pdo.organization_id = :organizationId
              AND p.patient_status != 'ARCHIVE'
              AND EXISTS (
                  SELECT 1 FROM treatment_plan tp
                  WHERE tp.patient_id = pdo.patient_id
                  AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
              )
        ),
        latest_manufacturing_batches AS (
            SELECT
                mb.treatment_plan_id,
                CASE
                    WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                         AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                    THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                    WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                    THEN mb.upper_aligner_end
                    WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                    THEN mb.lower_aligner_end
                    ELSE 0
                END AS max_aligner_end
            FROM manufacturing_batches mb
            WHERE mb.id = (
                SELECT MAX(mb2.id)
                FROM manufacturing_batches mb2
                WHERE mb2.treatment_plan_id = mb.treatment_plan_id
            )
        ),
        latest_aligner_journeys AS (
            SELECT DISTINCT ON (aj.patient_id)
                aj.id,
                aj.patient_id,
                aj.creation_status,
                aj.progress_status
            FROM aligner_journey aj
            JOIN organization_patients op ON aj.patient_id = op.patient_id
            WHERE aj.creation_status = 'DONE'
              AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
            ORDER BY aj.patient_id, aj.id DESC
        ),
        patient_aligner_status AS (
            SELECT
                op.patient_id,
                CASE
                    -- NOT_ADDED: No aligner journey exists
                    WHEN laj.id IS NULL THEN 'NOT_ADDED'

                    -- OVERDUE: End date is before current date
                    WHEN a.end_date < CURRENT_DATE THEN 'OVERDUE'

                    -- DUE_THIS_WEEK: End date is between today and 7 days from today (matches original logic)
                    WHEN a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_THIS_WEEK'

                    -- DUE_LATER: End date is more than 7 days away
                    WHEN a.end_date > CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_LATER'

                    ELSE 'UNKNOWN'
                END AS due_status,
                CASE
                    WHEN laj.id IS NOT NULL AND a.end_date IS NOT NULL THEN
                        CASE
                            WHEN a.end_date < CURRENT_DATE THEN 'OVERDUE'
                            WHEN a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'NEXT_SEVEN_DAYS'
                            WHEN a.end_date BETWEEN CURRENT_DATE + INTERVAL '8 days' AND CURRENT_DATE + INTERVAL '30 days' THEN 'NEXT_THIRTY_DAYS'
                            ELSE 'BEYOND_THIRTY_DAYS'
                        END
                    ELSE 'NOT_APPLICABLE'
                END AS extended_due_status
            FROM organization_patients op
            LEFT JOIN latest_aligner_journeys laj ON op.patient_id = laj.patient_id
            LEFT JOIN treatment_plan tp ON tp.patient_id = op.patient_id
                AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            LEFT JOIN latest_manufacturing_batches lmb ON lmb.treatment_plan_id = tp.id
            LEFT JOIN aligner a ON laj.id = a.aligner_journey_id
                AND a.sr_no = lmb.max_aligner_end
        )
        SELECT
            COUNT(DISTINCT CASE WHEN due_status = 'NOT_ADDED' THEN patient_id END) AS notAddedCount,
            COUNT(DISTINCT CASE WHEN due_status = 'OVERDUE' THEN patient_id END) AS overdueCount,
            COUNT(DISTINCT CASE WHEN due_status = 'DUE_TODAY' THEN patient_id END) AS dueTodayCount,
            COUNT(DISTINCT CASE WHEN due_status = 'DUE_THIS_WEEK' THEN patient_id END) AS dueThisWeekCount,
            COUNT(DISTINCT CASE WHEN due_status = 'DUE_LATER' THEN patient_id END) AS dueLaterCount,
            COUNT(DISTINCT CASE WHEN extended_due_status = 'OVERDUE' THEN patient_id END) AS overdue,
            COUNT(DISTINCT CASE WHEN extended_due_status = 'NEXT_SEVEN_DAYS' THEN patient_id END) AS nextSevenDaysCount,
            COUNT(DISTINCT CASE WHEN extended_due_status = 'NEXT_THIRTY_DAYS' THEN patient_id END) AS nextThirtyDaysCount,
            COUNT(DISTINCT patient_id) AS totalPatients
        FROM patient_aligner_status
        """)
    PatientDueStatusCounts getPatientDueStatusCountsByOrgForUnprocessedAligner(
            @Param("organizationId") Long organizationId);

    @Query(
            nativeQuery = true,
            value =
                    """
        WITH organization_patients AS (
            SELECT DISTINCT pdo.patient_id
            FROM patient_doctor_organization pdo
            JOIN patient p ON pdo.patient_id = p.id
            WHERE pdo.organization_id = :organizationId
                AND pdo.user_profile_id = :profileId
              AND p.patient_status != 'ARCHIVE'
              AND EXISTS (
                  SELECT 1 FROM treatment_plan tp
                  WHERE tp.patient_id = pdo.patient_id
                  AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
              )
        ),
        latest_manufacturing_batches AS (
            SELECT
                mb.treatment_plan_id,
                CASE
                    WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                         AND mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                    THEN GREATEST(mb.upper_aligner_end, mb.lower_aligner_end)
                    WHEN mb.upper_aligner_end IS NOT NULL AND mb.upper_aligner_end > 0
                    THEN mb.upper_aligner_end
                    WHEN mb.lower_aligner_end IS NOT NULL AND mb.lower_aligner_end > 0
                    THEN mb.lower_aligner_end
                    ELSE 0
                END AS max_aligner_end
            FROM manufacturing_batches mb
            WHERE mb.id = (
                SELECT MAX(mb2.id)
                FROM manufacturing_batches mb2
                WHERE mb2.treatment_plan_id = mb.treatment_plan_id
            )
        ),
        latest_aligner_journeys AS (
            SELECT DISTINCT ON (aj.patient_id)
                aj.id,
                aj.patient_id,
                aj.creation_status,
                aj.progress_status
            FROM aligner_journey aj
            JOIN organization_patients op ON aj.patient_id = op.patient_id
            WHERE aj.creation_status = 'DONE'
              AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'COMPLETE')
            ORDER BY aj.patient_id, aj.id DESC
        ),
        patient_aligner_status AS (
            SELECT
                op.patient_id,
                CASE
                    -- NOT_ADDED: No aligner journey exists
                    WHEN laj.id IS NULL THEN 'NOT_ADDED'

                    -- OVERDUE: End date is before current date
                    WHEN a.end_date < CURRENT_DATE THEN 'OVERDUE'

                    -- DUE_THIS_WEEK: End date is between today and 7 days from today (matches original logic)
                    WHEN a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_THIS_WEEK'

                    -- DUE_LATER: End date is more than 7 days away
                    WHEN a.end_date > CURRENT_DATE + INTERVAL '7 days' THEN 'DUE_LATER'

                    ELSE 'UNKNOWN'
                END AS due_status,
                CASE
                    WHEN laj.id IS NOT NULL AND a.end_date IS NOT NULL THEN
                        CASE
                            WHEN a.end_date < CURRENT_DATE THEN 'OVERDUE'
                            WHEN a.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' THEN 'NEXT_SEVEN_DAYS'
                            WHEN a.end_date BETWEEN CURRENT_DATE + INTERVAL '8 days' AND CURRENT_DATE + INTERVAL '30 days' THEN 'NEXT_THIRTY_DAYS'
                            ELSE 'BEYOND_THIRTY_DAYS'
                        END
                    ELSE 'NOT_APPLICABLE'
                END AS extended_due_status
            FROM organization_patients op
            LEFT JOIN latest_aligner_journeys laj ON op.patient_id = laj.patient_id
            LEFT JOIN treatment_plan tp ON tp.patient_id = op.patient_id
                AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            LEFT JOIN latest_manufacturing_batches lmb ON lmb.treatment_plan_id = tp.id
            LEFT JOIN aligner a ON laj.id = a.aligner_journey_id
                AND a.sr_no = lmb.max_aligner_end
        )
        SELECT
            COUNT(DISTINCT CASE WHEN due_status = 'NOT_ADDED' THEN patient_id END) AS notAddedCount,
            COUNT(DISTINCT CASE WHEN due_status = 'OVERDUE' THEN patient_id END) AS overdueCount,
            COUNT(DISTINCT CASE WHEN due_status = 'DUE_TODAY' THEN patient_id END) AS dueTodayCount,
            COUNT(DISTINCT CASE WHEN due_status = 'DUE_THIS_WEEK' THEN patient_id END) AS dueThisWeekCount,
            COUNT(DISTINCT CASE WHEN due_status = 'DUE_LATER' THEN patient_id END) AS dueLaterCount,
            COUNT(DISTINCT CASE WHEN extended_due_status = 'OVERDUE' THEN patient_id END) AS overdue,
            COUNT(DISTINCT CASE WHEN extended_due_status = 'NEXT_SEVEN_DAYS' THEN patient_id END) AS nextSevenDaysCount,
            COUNT(DISTINCT CASE WHEN extended_due_status = 'NEXT_THIRTY_DAYS' THEN patient_id END) AS nextThirtyDaysCount,
            COUNT(DISTINCT patient_id) AS totalPatients
        FROM patient_aligner_status
        """)
    PatientDueStatusCounts getPatientDueStatusCountsByOrgAndUserProfileIdForUnprocessedAligner(
            @Param("organizationId") Long organizationId, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
        SELECT COUNT(DISTINCT p.id)
        FROM patient p
        JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id
        WHERE pdo.user_profile_id = :userProfileId
          AND p.patient_status != 'ARCHIVE'
          AND p.patient_type = 'EXISTING_PATIENT'
          AND p.has_read_existing_patient_form = false
    """,
            nativeQuery = true)
    Long countExistingPatientsWithUnreadForm(@Param("userProfileId") Long userProfileId);

    @Query(
            """
        SELECT COUNT(DISTINCT p.id)
        FROM Patient p
        JOIN PatientDoctorOrganization pdo ON p.id = pdo.patient.id
        WHERE pdo.doctor.id = :doctorId
        AND pdo.userProfile.id = :profileId
        AND p.patientStatus != 'ARCHIVE'
    """)
    Long countActivePatientsByDoctorIdAndProfileId(
            @Param("doctorId") Long doctorId, @Param("profileId") Long profileId);

    @Query(
            """
        SELECT COUNT(DISTINCT p.id)
        FROM Patient p
        JOIN PatientDoctorOrganization pdo ON p.id = pdo.patient.id
        WHERE pdo.doctor.id = :doctorId
        AND p.patientStatus != 'ARCHIVE'
    """)
    Long countActivePatientsByDoctorId(@Param("doctorId") Long doctorId);

    @Query(
            """
        SELECT COUNT(DISTINCT pdo.patient.id)
        FROM PatientDoctorOrganization pdo
        LEFT JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
        LEFT JOIN Order o ON o.patient.id = pdo.patient.id
        WHERE pdo.patient.patientStatus != 'ARCHIVE'
            AND (tp.id IS NOT NULL OR o.id IS NOT NULL)
            AND (
                    :profileId IS NULL
                    OR (tp.id IS NOT NULL AND tp.outsourcedTo.id = :profileId)
                    OR (o.id IS NOT NULL AND (
                        (o.ownerProfile.id = :profileId AND o.targetProfile.id = :customerId) OR
                        (o.targetProfile.id = :profileId AND o.ownerProfile.id = :customerId)
                    ))
                )
    """)
    Long countDistinctPatientsByDoctorProfilesWithCustomerId(
            @Param("customerId") Long customerId, @Param("profileId") Long profileId);

    @Query(
            """
        SELECT COUNT(DISTINCT pdo.patient.id)
        FROM PatientDoctorOrganization pdo
        JOIN pdo.userProfile up
        JOIN pdo.patient p
        JOIN pdo.organization org
        WHERE up.id = :profileId
            AND (p.patientStatus IS NULL OR p.patientStatus != 'ARCHIVE')
    """)
    Long countDistinctPatientsByDoctorProfiles(@Param("profileId") Long profileId);

    @Query(
            """
        SELECT COUNT(DISTINCT pdo.patient.id)
        FROM PatientDoctorOrganization pdo
        JOIN pdo.userProfile up
        JOIN pdo.patient p
        WHERE up.id = :profileId
            AND p.productTypeName = :productTypeName
    """)
    Long countAllPatientBasedOnProductType(@Param("profileId") Long profileId, ProductTypeName productTypeName);

    @Query("SELECT pdo FROM PatientDoctorOrganization pdo " + "LEFT JOIN FETCH pdo.patient p "
            + "LEFT JOIN FETCH pdo.userProfile "
            + "LEFT JOIN FETCH pdo.patient "
            + "WHERE pdo.userProfile.id = :profileId")
    List<PatientDoctorOrganization> findByUserProfileId(@Param("profileId") Long profileId);

    @Query(
            """
    SELECT pdo.patient.id
    FROM PatientDoctorOrganization pdo
    JOIN pdo.patient p
    WHERE pdo.userProfile.id = :profileId
      AND p.productTypeName = :productType
""")
    List<Long> findPatientIdsByUserProfileIdAndProductType(
            @Param("profileId") Long profileId, @Param("productType") ProductTypeName productType);

    @Query(
            value = "SELECT * FROM patient_doctor_organization WHERE patient_id = :patientId LIMIT 1",
            nativeQuery = true)
    PatientDoctorOrganization findAnyByPatientId(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
            SELECT DISTINCT mobile_no
            FROM   (SELECT u.mobile_no,
                           'PATIENT' AS source
                    FROM   patient_doctor_organization pdo
                           JOIN user_profile up
                             ON up.id = pdo.user_profile_id
                           JOIN users u
                             ON u.id = up.id
                    WHERE  pdo.patient_id = :patientId
                    UNION
                    SELECT u.mobile_no,
                           'OWNER' AS source
                    FROM   patient_doctor_organization pdo
                           JOIN user_profile p
                             ON p.id = pdo.user_profile_id
                           JOIN user_profile o
                             ON o.id = CASE
                                         WHEN p.profile_type = 'OWNER' THEN p.id
                                         ELSE p.inviter_profile_id
                                       END
                           JOIN users u
                             ON u.id = o.id
                    WHERE  pdo.patient_id = :patientId
                    UNION
                    SELECT u.mobile_no,
                           'ADMIN' AS source
                    FROM   patient_doctor_organization pdo
                           JOIN user_profile p
                             ON p.id = pdo.user_profile_id
                           JOIN user_profile o
                             ON o.id = CASE
                                         WHEN p.profile_type = 'OWNER' THEN p.id
                                         ELSE p.inviter_profile_id
                                       END
                           JOIN user_profile a
                             ON a.inviter_profile_id = o.id
                           JOIN sub_role sr
                             ON sr.id = a.sub_role_id
                           JOIN users u
                             ON u.id = a.id
                    WHERE  pdo.patient_id = :patientId
                           AND sr.NAME = 'ADMIN'
                           AND sr.sub_role_tag = 'DEFAULT') AS mobile_no
            WHERE  mobile_no IS NOT NULL
                   AND mobile_no <> ''
    """,
            nativeQuery = true)
    List<String> findAdminAndCustomerAndSuperAdminMobileNumberByPatient(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
            SELECT DISTINCT mobile_no
            FROM   (SELECT u.mobile_no,
                           'PATIENT' AS source
                    FROM   patient_doctor_organization pdo
                           JOIN user_profile up
                             ON up.id = pdo.user_profile_id
                           JOIN users u
                             ON u.id = up.id
                    WHERE  pdo.patient_id = :patientId
                    UNION
                    SELECT u.mobile_no,
                           'ADMIN' AS source
                    FROM   patient_doctor_organization pdo
                           JOIN user_profile p
                             ON p.id = pdo.user_profile_id
                           JOIN user_profile o
                             ON o.id = CASE
                                         WHEN p.profile_type = 'OWNER' THEN p.id
                                         ELSE p.inviter_profile_id
                                       END
                           JOIN user_profile a
                             ON a.inviter_profile_id = o.id
                           JOIN sub_role sr
                             ON sr.id = a.sub_role_id
                           JOIN users u
                             ON u.id = a.id
                    WHERE  pdo.patient_id = :patientId
                           AND sr.NAME = 'ADMIN'
                           AND sr.sub_role_tag = 'DEFAULT') AS mobile_no
            WHERE  mobile_no IS NOT NULL
                   AND mobile_no <> ''
    """,
            nativeQuery = true)
    List<String> findAdminAndCustomerMobileNumberByPatient(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
            SELECT DISTINCT mobile_no
            FROM   (SELECT u.mobile_no,
                           'PATIENT' AS source
                    FROM   patient_doctor_organization pdo
                           JOIN user_profile up
                             ON up.id = pdo.user_profile_id
                           JOIN users u
                             ON u.id = up.id
                    WHERE  pdo.patient_id = :patientId
                    UNION
                    SELECT u.mobile_no,
                           'OWNER' AS source
                    FROM   patient_doctor_organization pdo
                           JOIN user_profile p
                             ON p.id = pdo.user_profile_id
                           JOIN user_profile o
                             ON o.id = CASE
                                         WHEN p.profile_type = 'OWNER' THEN p.id
                                         ELSE p.inviter_profile_id
                                       END
                           JOIN users u
                             ON u.id = o.id
                    WHERE  pdo.patient_id = :patientId
                    ) AS mobile_no
            WHERE mobile_no IS NOT NULL
                   AND mobile_no <> ''
    """,
            nativeQuery = true)
    List<String> findSuperAdminAndCustomerMobileNumberByPatient(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
        SELECT u.mobile_no
        FROM patient_doctor_organization pdo
        JOIN user_profile up
            ON up.id = pdo.user_profile_id
        JOIN user_profile owner
            ON owner.id =
                CASE
                    WHEN up.profile_type = 'OWNER'
                        THEN up.id
                    ELSE up.inviter_profile_id
                END
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = owner.id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        JOIN users u
            ON u.id = up.id
        WHERE pdo.patient_id = :patientId
          AND s.is_whats_app_messaging_enabled = TRUE
          AND u.mobile_no IS NOT NULL
          AND u.mobile_no <> ''
    """,
            nativeQuery = true)
    List<String> findCustomerMobileNumbersByPatient(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
        SELECT u.mobile_no
        FROM patient_doctor_organization pdo
        JOIN user_profile p
            ON p.id = pdo.user_profile_id
        JOIN user_profile owner
            ON owner.id =
                CASE
                    WHEN p.profile_type = 'OWNER'
                        THEN p.id
                    ELSE p.inviter_profile_id
                END
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = owner.id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        JOIN users u
            ON u.id = owner.id
        WHERE pdo.patient_id = :patientId
          AND s.is_whats_app_messaging_enabled = TRUE
          AND u.mobile_no IS NOT NULL
          AND u.mobile_no <> ''
    """,
            nativeQuery = true)
    List<String> findSuperAdminMobileNumbersByPatient(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
        SELECT DISTINCT u.mobile_no
        FROM patient_doctor_organization pdo
        JOIN user_profile p
            ON p.id = pdo.user_profile_id
        JOIN user_profile owner
            ON owner.id =
                CASE
                    WHEN p.profile_type = 'OWNER'
                        THEN p.id
                    ELSE p.inviter_profile_id
                END
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = owner.id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        JOIN user_profile a
            ON a.inviter_profile_id = owner.id
        JOIN sub_role sr
            ON sr.id = a.sub_role_id
        JOIN users u
            ON u.id = a.id
        WHERE pdo.patient_id = :patientId
          AND sr.name = 'ADMIN'
          AND sr.sub_role_tag = 'DEFAULT'
          AND s.is_whats_app_messaging_enabled = TRUE
          AND u.mobile_no IS NOT NULL
          AND u.mobile_no <> ''
    """,
            nativeQuery = true)
    List<String> findAdminMobileNumbersByPatient(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
        SELECT DISTINCT u.mobile_no
        FROM patient_task_tracker ptt
        JOIN user_profile assignee
            ON assignee.id = ptt.assignee_id
        JOIN users u
            ON u.id = assignee.id
        JOIN patient_doctor_organization pdo
            ON pdo.patient_id = ptt.patient_id
        JOIN user_profile patient_up
            ON patient_up.id = pdo.user_profile_id
        JOIN user_profile owner
            ON owner.id =
                CASE
                    WHEN patient_up.profile_type = 'OWNER'
                        THEN patient_up.id
                    ELSE patient_up.inviter_profile_id
                END
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = owner.id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id

        WHERE ptt.patient_id = :patientId
          AND ptt.id = :patientTaskTrackerId
          AND ptt.is_active = TRUE
          AND ptt.is_archived = FALSE
          AND ptt.assignee_id IS NOT NULL
          AND s.is_whats_app_messaging_enabled = TRUE
          AND u.mobile_no IS NOT NULL
          AND u.mobile_no <> ''
    """,
            nativeQuery = true)
    List<String> findAssignedUserMobileNumbersByPatient(
            @Param("patientId") Long patientId, @Param("patientTaskTrackerId") Long patientTaskTrackerId);

    @Query(
            """
    SELECT d.id
    FROM PatientDoctorOrganization pdo
    JOIN pdo.userProfile u
    JOIN u.doctor d
    WHERE pdo.patient.id = :patientId
""")
    Long findDoctorIdFromUserProfile(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
        SELECT EXISTS (
            SELECT 1
            FROM patient_doctor_organization pdo
            JOIN user_profile p
                ON p.id = pdo.user_profile_id
            JOIN user_profile owner
                ON owner.id =
                    CASE
                        WHEN p.profile_type = 'OWNER'
                            THEN p.id
                        ELSE p.inviter_profile_id
                    END
            JOIN subscription_user_mapping sum
                ON sum.user_profile_id = owner.id
            JOIN subscription s
                ON s.id = sum.subscription_plan_id
            WHERE pdo.patient_id = :patientId
              AND s.is_whats_app_messaging_enabled = TRUE
        )
        """,
            nativeQuery = true)
    boolean isWhatsAppEnabledByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id
    FROM PatientDoctorOrganization pdo
    WHERE pdo.userProfile.id = :profileId
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND (:search IS NULL OR :search = '' OR (
        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(CONCAT(pdo.patient.firstName, ' ', pdo.patient.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
    ))
""")
    List<Long> customerPatientIds(@Param("profileId") Long profileId, @Param("search") String search);

    @Query(
            """
    SELECT DISTINCT pdo.patient.id
    FROM PatientDoctorOrganization pdo
    WHERE (
       pdo.addedByUserProfile.id = :profileId
       OR pdo.orgUserProfile.id = :profileId
       OR pdo.userProfile.id = :profileId
   )
    AND pdo.patient.patientStatus != 'ARCHIVE'
    AND (:search IS NULL OR :search = '' OR (
        LOWER(pdo.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(pdo.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(pdo.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(pdo.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(CONCAT(pdo.patient.firstName, ' ', pdo.patient.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
    ))
""")
    List<Long> orgPatientAddedByCustomerPatientIds(@Param("profileId") Long profileId, @Param("search") String search);

    @Query(
            """
SELECT pdo FROM PatientDoctorOrganization pdo
LEFT JOIN FETCH pdo.userProfile up
LEFT JOIN FETCH pdo.orgUserProfile oup
LEFT JOIN FETCH oup.organization ownerOrg
LEFT JOIN FETCH up.user u
LEFT JOIN FETCH pdo.patient
WHERE pdo.patient.id = :patientId
""")
    PatientDoctorOrganization findByPatientOwnerOrgAndUserProfile(Long patientId);

    @Query(
            """
    SELECT DISTINCT p
    FROM Patient p
    LEFT JOIN FETCH p.doctorOrganization pdoFetch
    LEFT JOIN FETCH pdoFetch.doctor d
    LEFT JOIN FETCH pdoFetch.organization org
    LEFT JOIN FETCH pdoFetch.userProfile up
    LEFT JOIN FETCH pdoFetch.addedByUserProfile aup
    LEFT JOIN FETCH up.user u
    WHERE p.id = :patientId
    """)
    Optional<Patient> getPatientByProfileId(@Param("patientId") Long patientId);

    @Query(
            nativeQuery = true,
            value =
                    """
WITH itemIds AS (
    SELECT DISTINCT sci.service_item_id
    FROM patient_doctor_organization pdo
    JOIN user_profile up
        ON up.id = pdo.user_profile_id
    JOIN service_configurations sc
        ON sc.profile_id = up.id
    JOIN service_config_items sci
        ON sci.service_config_id = sc.id
    WHERE pdo.patient_id = :patientId
)
SELECT COALESCE(
    (
        SELECT si.item_name
        FROM service_items si
        WHERE si.id IN (SELECT service_item_id FROM itemIds)
        LIMIT 1
    ),
    'NO_SERVICE_NAME'
)
    """)
    String getEnabledServiceConfig(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT up
    FROM PatientDoctorOrganization pdo
    JOIN pdo.userProfile up
    WHERE pdo.patient.id = :patientId
""")
    UserProfile findPracticeProfile(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
            SELECT CASE
                WHEN up.profile_type = 'INVITED'
                    THEN up.inviter_profile_id
                ELSE up.id
            END
            FROM patient_doctor_organization pdo
            JOIN user_profile up ON up.id = pdo.added_by_user_profile_id
            WHERE pdo.patient_id = :patientId
            """,
            nativeQuery = true)
    Long findLabProfileId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT pdo FROM PatientDoctorOrganization pdo
    WHERE pdo.userProfile.id = :customerProfileId
      AND pdo.addedByUserProfile.id = :profileId
      AND pdo.organization.id = :orgId
""")
    Page<PatientDoctorOrganization> findPatientsForDashboard(
            @Param("customerProfileId") Long customerProfileId,
            @Param("profileId") Long profileId,
            @Param("orgId") Long orgId,
            Pageable pageable);

    @Query(
            """
    SELECT COUNT(DISTINCT pdo.patient.id) FROM PatientDoctorOrganization pdo
    WHERE pdo.userProfile.id = :customerProfileId
      AND pdo.orgUserProfile.id = :profileId
      AND pdo.organization.id = :orgId
""")
    Long countDistinctPatients(
            @Param("customerProfileId") Long customerProfileId,
            @Param("profileId") Long profileId,
            @Param("orgId") Long orgId);

    @Query(
            """
    SELECT pdo.patient.id
    FROM PatientDoctorOrganization pdo
    WHERE pdo.doctor.id = :doctorId
      AND pdo.patient.id IN :patientIds
      AND pdo.addedByUserProfile.id = :userProfileId
      AND pdo.organization.id = :organizationId
""")
    List<Long> findYourPatientIds(
            @Param("doctorId") Long doctorId,
            @Param("patientIds") Collection<Long> patientIds,
            @Param("userProfileId") Long userProfileId,
            @Param("organizationId") Long organizationId);

    @Query(
            value =
                    """
        WITH draft_orders AS (
            SELECT DISTINCT ON (o.patient_id)
                o.id, o.patient_id, o.status, o.created_at, o.updated_at, o.service_product_id
            FROM orders o
            JOIN patient p ON p.id = o.patient_id
            WHERE o.owner_profile_id = :profileId
              AND o.status = :draftStatus
              AND p.patient_status != :archiveStatus
            ORDER BY o.patient_id, o.created_at DESC
        ),
        latest_non_draft_orders AS (
            SELECT DISTINCT ON (o.patient_id)
                o.id, o.patient_id, o.status, o.created_at, o.updated_at, o.service_product_id
            FROM orders o
            JOIN patient p ON p.id = o.patient_id
            WHERE o.owner_profile_id = :profileId
              AND o.status != :draftStatus
              AND p.patient_status != :archiveStatus
            ORDER BY o.patient_id, o.created_at DESC
        ),
        no_order_patients AS (
            SELECT pdo.patient_id
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            WHERE pdo.user_profile_id = :profileId
              AND p.patient_status != :archiveStatus
              AND NOT EXISTS (
                  SELECT 1 FROM orders o WHERE o.patient_id = pdo.patient_id
              )
        ),
        patient_details AS (
            SELECT p.id, p.created_at
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            WHERE pdo.user_profile_id = :profileId
              AND p.patient_status != :archiveStatus
        )
        SELECT patientId, createdAt
        FROM (
            SELECT DISTINCT
                p.id                                    AS patientId,
                p.created_at                            AS createdAt,
                CONCAT(p.first_name, ' ', p.last_name)  AS patient_name,
                p.practice_location_name                AS practice_location_name,
                p.customer_mapped_id                    AS customer_mapped_id,
                COALESCE(
                    (SELECT sp2.product_name FROM service_products sp2 WHERE sp2.id = lndo.service_product_id),
                    (SELECT sp3.product_name FROM service_products sp3 WHERE sp3.id = do2.service_product_id)
                )                                       AS product_name,
                CASE
                    WHEN :isDraftRequested = true THEN
                        CASE WHEN do2.id IS NOT NULL THEN CAST(do2.status AS TEXT) ELSE NULL END
                    ELSE CAST(lndo.status AS TEXT)
                END                                     AS order_status,
                CASE
                    WHEN (
                        SELECT COUNT(*) FROM orders o_ct
                        WHERE o_ct.patient_id = p.id
                          AND o_ct.owner_profile_id = :profileId
                    ) > 1 THEN :refinementType
                    ELSE :initialType
                END                                     AS case_type_val,
                GREATEST(
                    COALESCE(lndo.updated_at, do2.updated_at, p.updated_at),
                    p.updated_at
                )                                       AS last_updated
            FROM patient_details pd
            JOIN patient p ON p.id = pd.id
            LEFT JOIN draft_orders do2             ON do2.patient_id = p.id
            LEFT JOIN latest_non_draft_orders lndo ON lndo.patient_id = p.id
            LEFT JOIN service_products sp          ON sp.id = lndo.service_product_id
            WHERE (:practiceLocationId IS NULL OR p.practice_location_id = :practiceLocationId)
              AND (:clinicId IS NULL OR p.practice_location_id = :clinicId)
              AND (:customerMappedId IS NULL OR p.customer_mapped_id = :customerMappedId)
              AND (:patientType IS NULL OR p.patient_type = :patientType)
              AND (:productId IS NULL OR sp.id = :productId)
              AND (
                    :#{#orderStatuses.size()} = 0
                    OR (
                        :isDraftRequested = true
                        AND (
                            do2.id IS NOT NULL
                            OR p.id IN (SELECT patient_id FROM no_order_patients)
                        )
                    )
                    OR (
                        :isDraftRequested = false
                        AND CAST(lndo.status AS TEXT) IN (:orderStatuses)
                    )
                  )
              AND (
                    :caseType IS NULL
                    OR (:caseType = :refinementType AND (
                            SELECT COUNT(*) FROM orders o_ct
                            WHERE o_ct.patient_id = p.id AND o_ct.owner_profile_id = :profileId
                        ) > 1)
                    OR (:caseType = :initialType AND (
                            SELECT COUNT(*) FROM orders o_ct
                            WHERE o_ct.patient_id = p.id AND o_ct.owner_profile_id = :profileId
                        ) <= 1)
                  )
              AND (
                    :search IS NULL OR
                    LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.practice_location_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    LOWER(p.patient_type) LIKE LOWER(CONCAT('%', :search, '%')) OR
                    CAST(p.id AS TEXT) LIKE CONCAT('%', :search, '%')
                  )
        ) sub
        ORDER BY
            CASE WHEN :sortBy = 'patient'     AND :sortDirection = 'ASC'  THEN patient_name           END ASC,
            CASE WHEN :sortBy = 'patient'     AND :sortDirection = 'DESC' THEN patient_name           END DESC,
            CASE WHEN :sortBy = 'clinic'      AND :sortDirection = 'ASC'  THEN practice_location_name END ASC,
            CASE WHEN :sortBy = 'clinic'      AND :sortDirection = 'DESC' THEN practice_location_name END DESC,
            CASE WHEN :sortBy = 'id'          AND :sortDirection = 'ASC'  THEN customer_mapped_id     END ASC,
            CASE WHEN :sortBy = 'id'          AND :sortDirection = 'DESC' THEN customer_mapped_id     END DESC,
            CASE WHEN :sortBy = 'product'     AND :sortDirection = 'ASC'  THEN product_name           END ASC,
            CASE WHEN :sortBy = 'product'     AND :sortDirection = 'DESC' THEN product_name           END DESC,
            CASE WHEN :sortBy = 'caseType'    AND :sortDirection = 'ASC'  THEN case_type_val          END ASC,
            CASE WHEN :sortBy = 'caseType'    AND :sortDirection = 'DESC' THEN case_type_val          END DESC,
            CASE WHEN :sortBy = 'status'      AND :sortDirection = 'ASC'  THEN order_status           END ASC,
            CASE WHEN :sortBy = 'status'      AND :sortDirection = 'DESC' THEN order_status           END DESC,
            CASE WHEN :sortBy = 'lastUpdated' AND :sortDirection = 'ASC'  THEN last_updated           END ASC,
            CASE WHEN :sortBy = 'lastUpdated' AND :sortDirection = 'DESC' THEN last_updated           END DESC,
            last_updated DESC
    """,
            countQuery =
                    """
        WITH draft_orders AS (
            SELECT DISTINCT ON (o.patient_id) o.patient_id
            FROM orders o
            JOIN patient p ON p.id = o.patient_id
            WHERE o.owner_profile_id = :profileId
              AND o.status = :draftStatus
              AND p.patient_status != :archiveStatus
            ORDER BY o.patient_id, o.created_at DESC
        ),
        latest_non_draft_orders AS (
            SELECT DISTINCT ON (o.patient_id)
                o.id, o.patient_id, o.status, o.service_product_id
            FROM orders o
            JOIN patient p ON p.id = o.patient_id
            WHERE o.owner_profile_id = :profileId
              AND o.status != :draftStatus
              AND p.patient_status != :archiveStatus
            ORDER BY o.patient_id, o.created_at DESC
        ),
        no_order_patients AS (
            SELECT pdo.patient_id
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            WHERE pdo.user_profile_id = :profileId
              AND p.patient_status != :archiveStatus
              AND NOT EXISTS (
                  SELECT 1 FROM orders o WHERE o.patient_id = pdo.patient_id
              )
        ),
        patient_details AS (
            SELECT p.id
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            WHERE pdo.user_profile_id = :profileId
              AND p.patient_status != :archiveStatus
        )
        SELECT COUNT(DISTINCT p.id)
        FROM patient_details pd
        JOIN patient p ON p.id = pd.id
        LEFT JOIN draft_orders do2             ON do2.patient_id = p.id
        LEFT JOIN latest_non_draft_orders lndo ON lndo.patient_id = p.id
        LEFT JOIN service_products sp          ON sp.id = lndo.service_product_id
        WHERE (:practiceLocationId IS NULL OR p.practice_location_id = :practiceLocationId)
          AND (:clinicId IS NULL OR p.practice_location_id = :clinicId)
          AND (:customerMappedId IS NULL OR p.customer_mapped_id = :customerMappedId)
          AND (:patientType IS NULL OR p.patient_type = :patientType)
          AND (:productId IS NULL OR sp.id = :productId)
          AND (
                :#{#orderStatuses.size()} = 0
                OR (
                    :isDraftRequested = true
                    AND (
                        do2.patient_id IS NOT NULL
                        OR p.id IN (SELECT patient_id FROM no_order_patients)
                    )
                )
                OR (
                    :isDraftRequested = false
                    AND CAST(lndo.status AS TEXT) IN (:orderStatuses)
                )
              )
          AND (
                :caseType IS NULL
                OR (:caseType = :refinementType AND (
                        SELECT COUNT(*) FROM orders o_ct
                        WHERE o_ct.patient_id = p.id AND o_ct.owner_profile_id = :profileId
                    ) > 1)
                OR (:caseType = :initialType AND (
                        SELECT COUNT(*) FROM orders o_ct
                        WHERE o_ct.patient_id = p.id AND o_ct.owner_profile_id = :profileId
                    ) <= 1)
              )
          AND (
                :search IS NULL OR
                LOWER(p.first_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.last_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(CONCAT(p.first_name, ' ', p.last_name)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.practice_location_name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.patient_type) LIKE LOWER(CONCAT('%', :search, '%')) OR
                CAST(p.id AS TEXT) LIKE CONCAT('%', :search, '%')
              )
          AND (1=1 OR :sortBy IS NULL OR :sortDirection IS NULL)
    """,
            nativeQuery = true)
    Page<PatientCaseProjection> findPatientIdsWithFiltersAndPagination(
            @Param("profileId") Long profileId,
            @Param("practiceLocationId") Long practiceLocationId,
            @Param("clinicId") Long clinicId,
            @Param("customerMappedId") String customerMappedId,
            @Param("patientType") String patientType,
            @Param("productId") Long productId,
            @Param("caseType") String caseType,
            @Param("orderStatuses") List<String> orderStatuses,
            @Param("isDraftRequested") boolean isDraftRequested,
            @Param("search") String search,
            @Param("sortBy") String sortBy,
            @Param("sortDirection") String sortDirection,
            @Param("draftStatus") String draftStatus,
            @Param("archiveStatus") String archiveStatus,
            @Param("refinementType") String refinementType,
            @Param("initialType") String initialType,
            Pageable pageable);

    @Query(
            value =
                    """
        SELECT
            p.id                                        AS patientId,
            p.first_name                                AS firstName,
            p.last_name                                 AS lastName,
            CONCAT(p.first_name, ' ', p.last_name)      AS fullName,
            p.email                                     AS email,
            p.mobile_no                                 AS mobileNo,
            p.profile_picture_url                       AS profilePictureUrl,
            p.customer_mapped_id                        AS customerMappedId,
            p.practice_location_id                      AS practiceLocationId,
            p.practice_location_name                    AS practiceLocationName,
            p.country_code                              AS countryCode,
            p.created_at                                AS createdAt,
            p.updated_at                                AS patientUpdatedAt,
            p.profile_image_id                          AS profileImageId,

            latest_o.id                                 AS latestOrderId,
            sp.product_name                             AS productName,
            CAST(latest_o.status AS TEXT)               AS orderStatus,
            CASE
                WHEN order_counts.total_orders > 1 THEN 'REFINEMENT'
                ELSE 'INITIAL'
            END                                         AS caseType,
            CASE
                WHEN latest_o.updated_at IS NULL THEN p.updated_at
                ELSE GREATEST(latest_o.updated_at, p.updated_at)
            END                                         AS lastUpdated
        FROM patient p
        LEFT JOIN LATERAL (
            SELECT o.*
            FROM orders o
            WHERE o.patient_id = p.id
            ORDER BY o.created_at DESC
            LIMIT 1
        ) latest_o ON TRUE
        LEFT JOIN service_products sp ON sp.id = latest_o.service_product_id
        LEFT JOIN (
            SELECT patient_id, COUNT(*) AS total_orders
            FROM orders
            GROUP BY patient_id
        ) order_counts ON order_counts.patient_id = p.id
        WHERE p.id IN (:patientIds)
    """,
            nativeQuery = true)
    List<PatientListSummaryV2> findPatientSummariesByIds(@Param("patientIds") List<Long> patientIds);
}
