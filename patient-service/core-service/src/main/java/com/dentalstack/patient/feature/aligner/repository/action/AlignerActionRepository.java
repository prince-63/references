package com.dentalstack.patient.feature.aligner.repository.action;

import com.dentalstack.patient.feature.aligner.entity.action.AlignerAction;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.projection.AlignerActionCounts;
import com.dentalstack.patient.feature.aligner.projection.AlignerActionDetailsSummary;
import feign.Param;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerActionRepository extends JpaRepository<AlignerAction, Long> {

    @Query("SELECT " + "a.id AS alignerActionId, "
            + "a.performedAt AS performedAt, "
            + "p.firstName AS firstName, "
            + "p.lastName AS lastName, "
            + "p.profilePictureUrl AS profileUrl, "
            + "a.metadata AS metadata, "
            + "aligner.jawType AS jawType, "
            + "aligner.srNo AS alignerNumber, "
            + "a.performedBy AS performedBy, "
            + "p.id AS patientId, "
            + "aj.id AS alignerJourneyId "
            + "FROM AlignerAction a "
            + "JOIN a.aligner aligner "
            + "JOIN aligner.alignerJourney aj "
            + "JOIN aj.patient p "
            + "WHERE p.id IN :patientIds "
            + "AND a.type = :actionType "
            + "AND a.performedAt >= :startDate "
            + "AND a.performedAt < :endDate "
            + "AND (:isActive IS NULL OR a.isActive = :isActive) "
            + "ORDER BY a.performedAt ASC")
    List<AlignerActionDetailsSummary> findAlignerActionDetailsForPatientsWithinDateRange(
            @Param("patientIds") List<Long> patientIds,
            @Param("actionType") AlignerActionType actionType,
            @Param("startDate") ZonedDateTime startDate,
            @Param("endDate") ZonedDateTime endDate,
            @Param("isActive") Boolean isActive);

    @Query(
            nativeQuery = true,
            value =
                    """
    SELECT
        COUNT(DISTINCT CASE
            WHEN aa.type = 'ALIGNER_CHANGE' AND aa.validated = false
            AND aa.is_active = :isActive
            THEN CONCAT(p.id, '-', aa.type)
        END) AS alignerChangesCompleted,

        COUNT(DISTINCT CASE
            WHEN aa.type = 'CHECK_IN' AND aa.validated = false
            AND aa.is_active = :isActive
            THEN CONCAT(p.id, '-', aa.type)
        END) AS alignerCheckInMade,

        COUNT(DISTINCT CASE
            WHEN aa.type = 'ISSUE_REPORT' AND aa.validated = false
            AND aa.is_active = :isActive
            THEN CONCAT(p.id, '-', aa.type)
        END) AS reportedIssues

    FROM aligner_journey aj
    JOIN tracking t ON t.aligner_journey_id = aj.id
    JOIN patient p ON p.id = aj.patient_id
    LEFT JOIN aligner a ON a.aligner_journey_id = aj.id
    LEFT JOIN aligner_action aa ON aa.aligner_id = a.id
    WHERE aj.doctor_id = :doctorId
        AND aj.progress_status = 'IN_PROGRESS'
        AND t.tracking_type = 1
        AND (aa.type IS NULL OR aa.type NOT IN ('FORCE_ALIGNER_CHANGE', 'MOVE_TO_PREVIOUS_ALIGNER'))
""")
    AlignerActionCounts getAlignerActionCounts(@Param("doctorId") Long doctorId, @Param("isActive") Boolean isActive);

    @Query(
            nativeQuery = true,
            value =
                    """
                    WITH latest_journey AS (
                        SELECT
                            aj.patient_id,
                            aj.id AS journey_id,
                            ROW_NUMBER() OVER (PARTITION BY aj.patient_id ORDER BY aj.created_at DESC) AS rn
                        FROM aligner_journey aj
                        WHERE aj.patient_id IN (:patientIds)
                        AND aj.creation_status = 'DONE'
                        AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED', 'DEACTIVATED')
                    ),
                    patients_with_actions AS (
                        SELECT DISTINCT lj.patient_id
                        FROM latest_journey lj
                        JOIN aligner a ON a.aligner_journey_id = lj.journey_id
                        JOIN aligner_action aa ON aa.aligner_id = a.id
                        WHERE lj.rn = 1
                        AND aa.type IN ('CHECK_IN', 'ALIGNER_CHANGE', 'ISSUE_REPORT')
                    ),
                    unvalidated_actions AS (
                        SELECT
                            aj.patient_id,
                            COUNT(CASE WHEN aa.type IN ('CHECK_IN', 'ALIGNER_CHANGE', 'ISSUE_REPORT') AND aa.validated = false THEN 1 ELSE NULL END) AS total_unvalidated_actions
                        FROM latest_journey lj
                        JOIN aligner_journey aj ON aj.id = lj.journey_id
                        JOIN aligner a ON a.aligner_journey_id = aj.id
                        JOIN aligner_action aa ON aa.aligner_id = a.id
                        WHERE lj.rn = 1
                        AND aj.patient_id IN (SELECT patient_id FROM patients_with_actions)
                        AND aa.type IN ('CHECK_IN', 'ALIGNER_CHANGE', 'ISSUE_REPORT')
                        GROUP BY aj.patient_id
                    )
                    SELECT
                        COALESCE(SUM(ua.total_unvalidated_actions), 0) AS totalUnvalidatedActions
                    FROM unvalidated_actions ua
                    """)
    Integer findTotalUnvalidatedActionsForAllPatients(@Param("patientIds") Set<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
            WITH profile_patients AS (
                SELECT DISTINCT pdo.patient_id
                FROM patient_doctor_organization pdo
                JOIN tracking t ON t.patient_id = pdo.patient_id
                JOIN patient p ON p.id = pdo.patient_id
                WHERE pdo.doctor_id = :doctorId
                AND pdo.organization_id = :organizationId
                AND pdo.user_profile_id = :profileId
                AND p.patient_status != 'ARCHIVE'
                AND t.tracking_type = 1
            ),
            latest_journey AS (
                SELECT
                    aj.patient_id,
                    aj.id AS journey_id,
                    ROW_NUMBER() OVER (PARTITION BY aj.patient_id ORDER BY aj.created_at DESC) AS rn
                FROM aligner_journey aj
                WHERE aj.patient_id IN (SELECT patient_id FROM profile_patients)
                AND aj.creation_status = 'DONE'
                AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED')
            ),
            unvalidated_actions AS (
                SELECT
                    aj.patient_id,
                    COUNT(CASE WHEN aa.type = 'CHECK_IN' AND aa.validated = false THEN 1 ELSE NULL END) AS unvalidated_checkins,
                    COUNT(CASE WHEN aa.type = 'ALIGNER_CHANGE' AND aa.validated = false THEN 1 ELSE NULL END) AS unvalidated_aligner_changes,
                    COUNT(CASE WHEN aa.type = 'ISSUE_REPORT' AND aa.validated = false THEN 1 ELSE NULL END) AS unvalidated_issue_reports,
                    COUNT(CASE WHEN aa.type IN ('CHECK_IN', 'ALIGNER_CHANGE', 'ISSUE_REPORT') AND aa.validated = false THEN 1 ELSE NULL END) AS total_unvalidated_actions
                FROM latest_journey lj
                JOIN aligner_journey aj ON aj.id = lj.journey_id
                JOIN aligner a ON a.aligner_journey_id = aj.id
                LEFT JOIN aligner_action aa ON aa.aligner_id = a.id AND aa.type IN ('CHECK_IN', 'ALIGNER_CHANGE', 'ISSUE_REPORT')
                WHERE lj.rn = 1
                GROUP BY aj.patient_id
            )
            SELECT COALESCE(SUM(ua.total_unvalidated_actions), 0)
            FROM unvalidated_actions ua
        """)
    Integer getTotalUnvalidatedActionsForProfile(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);

    boolean existsByAlignerIdAndTypeAndIsActiveTrue(Long alignerId, AlignerActionType type);
}
