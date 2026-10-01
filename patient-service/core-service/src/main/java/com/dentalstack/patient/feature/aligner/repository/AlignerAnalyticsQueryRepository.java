package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.projection.*;
import feign.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerAnalyticsQueryRepository extends JpaRepository<AlignerJourney, Long> {

    @Query(
            nativeQuery = true,
            value =
                    """
    WITH latest_journeys AS (
        SELECT DISTINCT ON (aj.patient_id) aj.*
        FROM aligner_journey aj
        WHERE aj.patient_id IN (:patientIds)
        AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED')
        AND aj.creation_status = 'DONE'
        ORDER BY aj.patient_id, aj.created_at DESC
    ),
    current_aligners AS (
        SELECT
            a.*,
            lj.patient_id,
            CASE
                WHEN a.end_date < CURRENT_DATE - INTERVAL '7 DAYS' THEN 'NEED_ATTENTION'
                WHEN a.end_date < CURRENT_DATE THEN 'AT_RISK'
                ELSE 'ON_TRACK'
            END AS compliance_status
        FROM aligner a
        JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
        WHERE a.sr_no = lj.current_aligner_no
    )
    SELECT
        COUNT(DISTINCT CASE WHEN compliance_status = 'NEED_ATTENTION' THEN patient_id END) AS needsAttentionCount,
        COUNT(DISTINCT CASE WHEN compliance_status = 'AT_RISK' THEN patient_id END) AS atRiskCount,
        COUNT(DISTINCT CASE WHEN compliance_status = 'ON_TRACK' THEN patient_id END) AS onTrackCount,
        COUNT(DISTINCT patient_id) AS totalPatients
    FROM current_aligners
    """)
    AlignerAnalyticsCounts getAlignerAnalyticsCounts(@Param("patientIds") List<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
        WITH organization_patients AS (
            SELECT DISTINCT pdo.patient_id
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            JOIN tracking t ON t.patient_id = pdo.patient_id
            WHERE pdo.organization_id = :organizationId
            AND p.patient_status != 'ARCHIVE'
            AND t.tracking_type = 1
        ),
        latest_journeys AS (
            SELECT DISTINCT ON (aj.patient_id) aj.*
            FROM aligner_journey aj
            JOIN organization_patients op ON aj.patient_id = op.patient_id
            WHERE aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED')
            AND aj.creation_status = 'DONE'
            ORDER BY aj.patient_id, aj.created_at DESC
        ),
        current_aligners AS (
            SELECT
                a.*,
                lj.patient_id,
                CASE
                    WHEN a.end_date < CURRENT_DATE - INTERVAL '7 DAYS' THEN 'NEED_ATTENTION'
                    WHEN a.end_date < CURRENT_DATE THEN 'AT_RISK'
                    ELSE 'ON_TRACK'
                END AS compliance_status
            FROM aligner a
            JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
            WHERE a.sr_no = lj.current_aligner_no
        )
        SELECT
            COUNT(DISTINCT CASE WHEN compliance_status = 'NEED_ATTENTION' THEN patient_id END) AS needsAttentionCount,
            COUNT(DISTINCT CASE WHEN compliance_status = 'AT_RISK' THEN patient_id END) AS atRiskCount,
            COUNT(DISTINCT CASE WHEN compliance_status = 'ON_TRACK' THEN patient_id END) AS onTrackCount,
            COUNT(DISTINCT patient_id) AS totalPatients
        FROM current_aligners
        """)
    AlignerAnalyticsCounts getAlignerAnalyticsCountsByOrg(@Param("organizationId") Long organizationId);

    @Query(
            nativeQuery = true,
            value =
                    """
        WITH organization_patients AS (
            SELECT DISTINCT pdo.patient_id
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            JOIN tracking t ON t.patient_id = pdo.patient_id
            WHERE pdo.organization_id = :organizationId
            AND pdo.user_profile_id = :userProfileId
            AND p.patient_status != 'ARCHIVE'
            AND t.tracking_type = 1
        ),
        latest_journeys AS (
            SELECT DISTINCT ON (aj.patient_id) aj.*
            FROM aligner_journey aj
            JOIN organization_patients op ON aj.patient_id = op.patient_id
            WHERE aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED')
            AND aj.creation_status = 'DONE'
            ORDER BY aj.patient_id, aj.created_at DESC
        ),
        current_aligners AS (
            SELECT
                a.*,
                lj.patient_id,
                CASE
                    WHEN a.end_date < CURRENT_DATE - INTERVAL '7 DAYS' THEN 'NEED_ATTENTION'
                    WHEN a.end_date < CURRENT_DATE THEN 'AT_RISK'
                    ELSE 'ON_TRACK'
                END AS compliance_status
            FROM aligner a
            JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
            WHERE a.sr_no = lj.current_aligner_no
        )
        SELECT
            COUNT(DISTINCT CASE WHEN compliance_status = 'NEED_ATTENTION' THEN patient_id END) AS needsAttentionCount,
            COUNT(DISTINCT CASE WHEN compliance_status = 'AT_RISK' THEN patient_id END) AS atRiskCount,
            COUNT(DISTINCT CASE WHEN compliance_status = 'ON_TRACK' THEN patient_id END) AS onTrackCount,
            COUNT(DISTINCT patient_id) AS totalPatients
        FROM current_aligners
        """)
    AlignerAnalyticsCounts getAlignerAnalyticsCountsByOrgAndUserProfileId(
            @Param("organizationId") Long organizationId, @Param("userProfileId") Long userProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
        WITH organization_patients AS (
            SELECT DISTINCT pdo.patient_id
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            JOIN tracking t ON t.patient_id = pdo.patient_id
            WHERE pdo.organization_id = :organizationId
            AND pdo.user_profile_id = :userProfileId
            AND p.patient_status != 'ARCHIVE'
            AND t.tracking_type = 1
        ),
        latest_journeys AS (
            SELECT DISTINCT ON (aj.patient_id) aj.*
            FROM aligner_journey aj
            JOIN organization_patients op ON aj.patient_id = op.patient_id
            WHERE aj.progress_status = 'IN_PROGRESS'
            AND aj.creation_status = 'DONE'
            ORDER BY aj.patient_id, aj.created_at DESC
        ),
        current_aligners AS (
            SELECT
                a.*,
                lj.patient_id,
                CASE
                    WHEN CURRENT_DATE > (a.end_date + INTERVAL '7 DAYS') THEN 'NEEDS_ATTENTION'
                    WHEN CURRENT_DATE > a.end_date THEN 'AT_RISK'
                    ELSE 'ON_TRACK'
                END AS compliance_status
            FROM aligner a
            JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
            WHERE a.sr_no = lj.current_aligner_no
        )
        SELECT
            COUNT(DISTINCT CASE WHEN compliance_status = 'NEEDS_ATTENTION' THEN patient_id END) AS needsAttentionCount,
            COUNT(DISTINCT CASE WHEN compliance_status = 'AT_RISK' THEN patient_id END) AS atRiskCount,
            COUNT(DISTINCT CASE WHEN compliance_status = 'ON_TRACK' THEN patient_id END) AS onTrackCount,
            COUNT(DISTINCT patient_id) AS totalPatients
        FROM current_aligners
        """)
    AlignerAnalyticsCounts getAlignerAnalyticsCountsByPractice(
            @Param("organizationId") Long organizationId, @Param("userProfileId") Long userProfileId);

    @Query(
            nativeQuery = true,
            value =
                    """
WITH latest_journeys AS (
    SELECT DISTINCT ON (aj.patient_id) aj.*
    FROM aligner_journey aj
    WHERE aj.patient_id IN (:patientIds)
    AND aj.progress_status = 'IN_PROGRESS'
    AND aj.creation_status = 'DONE'
    ORDER BY aj.patient_id, aj.created_at DESC
),
journey_aligners AS (
    SELECT a.*, lj.patient_id
    FROM aligner a
    JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
),
aligner_actions AS (
    SELECT
        aa.id,
        DATE(aa.performed_at) AS performed_date,
        ja.end_date
    FROM aligner_action aa
    JOIN journey_aligners ja ON aa.aligner_id = ja.id
    WHERE aa.type = 'ALIGNER_CHANGE'
)
SELECT
    COUNT(CASE WHEN performed_date < end_date THEN id END) AS earlyChangesCount,
    COUNT(CASE WHEN performed_date = end_date THEN id END) AS onTimeChangesCount,
    COUNT(CASE WHEN performed_date > end_date AND performed_date < end_date + INTERVAL '7 days' THEN id END) AS delayLessThan7DaysCount,
    COUNT(CASE WHEN performed_date >= end_date + INTERVAL '7 days' THEN id END) AS delayMoreThan7DaysCount,
    COUNT(id) AS totalAlignerChanges
FROM aligner_actions
    """)
    AlignerAnalyticsCounts getAlignerChangeCounts(@Param("patientIds") List<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
WITH latest_journeys AS (
    SELECT DISTINCT ON (aj.patient_id) aj.*
    FROM aligner_journey aj
    WHERE aj.patient_id IN (:patientIds)
    AND aj.progress_status = 'IN_PROGRESS'
    AND aj.creation_status = 'DONE'
    ORDER BY aj.patient_id, aj.created_at DESC
),
journey_aligners AS (
    SELECT a.*, lj.patient_id
    FROM aligner a
    JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
)
SELECT
    COUNT(DISTINCT CASE
        WHEN aa.type = 'CHECK_IN' AND EXISTS (
            SELECT 1
            FROM aligner_feedback af
            WHERE CAST(af.id AS TEXT) = ANY(
                SELECT jsonb_array_elements_text(aa.metadata->'alignerFeedbackIds')
            )
            AND (
                -- If UPPER exists, it must be PERFECT_FIT
                (af.feedback->'feedbacks'->'UPPER' IS NULL OR
                (af.feedback->'feedbacks'->'UPPER'->'fitting_feedback'->'fittings'->>0) = 'PERFECT_FIT')
                OR
                -- If LOWER exists, it must be PERFECT_FIT
                (af.feedback->'feedbacks'->'LOWER' IS NULL OR
                (af.feedback->'feedbacks'->'LOWER'->'fitting_feedback'->'fittings'->>0) = 'PERFECT_FIT')
                AND
                -- At least one of UPPER or LOWER must exist
                (af.feedback->'feedbacks'->'UPPER' IS NOT NULL OR af.feedback->'feedbacks'->'LOWER' IS NOT NULL)
            )
        ) THEN aa.id
    END) AS perfectFitCount
FROM
    aligner_action aa
JOIN journey_aligners ja ON aa.aligner_id = ja.id
WHERE
    aa.type = 'CHECK_IN'
    """)
    AlignerAnalyticsCounts getPerfectFitCounts(@Param("patientIds") List<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
WITH latest_journeys AS (
    SELECT DISTINCT ON (aj.patient_id) aj.*
    FROM aligner_journey aj
    WHERE aj.patient_id IN (:patientIds)
    AND aj.progress_status = 'IN_PROGRESS'
    AND aj.creation_status = 'DONE'
    ORDER BY aj.patient_id, aj.created_at DESC
),
journey_aligners AS (
    SELECT a.*, lj.patient_id
    FROM aligner a
    JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
    WHERE a.sr_no = lj.current_aligner_no
)
SELECT
    COUNT(DISTINCT CASE
        WHEN aa.type = 'CHECK_IN' AND (
            EXISTS (
                SELECT 1 FROM aligner_feedback af
                WHERE CAST(af.id AS TEXT) = ANY(
                    SELECT jsonb_array_elements_text(aa.metadata->'alignerFeedbackIds')
                )
                AND (
                    (af.feedback->'feedbacks'->'UPPER'->'fitting_feedback'->'fittings'->>0) != 'PERFECT_FIT'
                    OR
                    (af.feedback->'feedbacks'->'LOWER'->'fitting_feedback'->'fittings'->>0) != 'PERFECT_FIT'
                )
            )
            OR
            NOT EXISTS (
                SELECT 1 FROM aligner_feedback af
                WHERE CAST(af.id AS TEXT) = ANY(
                    SELECT jsonb_array_elements_text(aa.metadata->'alignerFeedbackIds')
                )
            )
        ) THEN aa.id
        ELSE NULL
    END) AS someIssuesCount
FROM
    aligner_action aa
JOIN journey_aligners ja ON aa.aligner_id = ja.id
WHERE
    aa.type = 'CHECK_IN'
""")
    AlignerAnalyticsCounts getIssuesCounts(@Param("patientIds") List<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
WITH latest_journeys AS (
    SELECT DISTINCT ON (aj.patient_id) aj.*
    FROM aligner_journey aj
    WHERE aj.patient_id IN (:patientIds)
    AND aj.progress_status = 'IN_PROGRESS'
    AND aj.creation_status = 'DONE'
    ORDER BY aj.patient_id, aj.created_at DESC
),
journey_aligners AS (
    SELECT a.*, lj.patient_id
    FROM aligner a
    JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
)
SELECT
    COUNT(CASE WHEN aa.type = 'ISSUE_REPORT' THEN aa.id END) AS totalIssuesCount,
    COUNT(CASE WHEN aa.type = 'ISSUE_REPORT' AND aa.metadata->>'issue' = 'MISSING_ALIGNER' THEN aa.id END) AS missingAlignerCount,
    COUNT(CASE WHEN aa.type = 'ISSUE_REPORT' AND aa.metadata->>'issue' = 'BROKEN_ALIGNER' THEN aa.id END) AS brokenAlignerCount,
    COUNT(CASE WHEN aa.type = 'ISSUE_REPORT' AND aa.metadata->>'issue' = 'IRRIGATION_TO_GUM' THEN aa.id END) AS irritationToGumsCount,
    COUNT(CASE WHEN aa.type = 'ISSUE_REPORT' AND aa.metadata->>'issue' = 'SHARP_EDGES' THEN aa.id END) AS sharpEdgesCount
FROM
    aligner_action aa
JOIN journey_aligners ja ON aa.aligner_id = ja.id
WHERE
    aa.type = 'ISSUE_REPORT'
    """)
    AlignerAnalyticsCounts getReportedIssuesCounts(@Param("patientIds") List<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
        WITH latest_journeys AS (
            SELECT DISTINCT ON (aj.patient_id) aj.*
            FROM aligner_journey aj
            WHERE aj.patient_id IN (:patientIds)
            AND aj.progress_status = 'IN_PROGRESS'
            AND aj.creation_status = 'DONE'
            ORDER BY aj.patient_id, aj.created_at DESC
        ),
        journey_aligners AS (
            SELECT a.*, lj.patient_id
            FROM aligner a
            JOIN latest_journeys lj ON a.aligner_journey_id = lj.id
        )
        SELECT COUNT(DISTINCT ja.patient_id)
        FROM aligner_action aa
        JOIN journey_aligners ja ON aa.aligner_id = ja.id
        WHERE aa.type IN ('CHECK_IN', 'ALIGNER_CHANGE', 'ISSUE_REPORT') AND aa.validated = false
    """)
    Long countUniquePatientsWithActions(@Param("patientIds") List<Long> patientIds);

    @Query(
            nativeQuery = true,
            value =
                    """
                    SELECT
                        a.id AS alignerId,
                        prev_a.change_date AS changeDate,
                        prev_a.end_date AS endDate,
                        new_a.jaw_type AS currentJawType,
                        new_a.sr_no AS currentAlignerNumber,
                        COALESCE(
                            CASE WHEN EXISTS (
                                SELECT 1
                                FROM aligner_action aa2
                                WHERE aa2.aligner_id = a.id
                                AND aa2.type = 'CHECK_IN'
                            ) THEN 'true' ELSE 'false' END,
                            'false'
                        ) AS checkInPerformed,
                        CASE WHEN t.tracking_type = 0 THEN 'true' ELSE 'false' END AS manual,
                        p.id AS patientId,
                        aj.id AS alignerJourneyId,
                        p.first_name AS firstName,
                        p.last_name AS lastName,
                        p.profile_picture_url AS profileUrl,
                        aa.id AS actionId,
                        prev_a.id AS previousAlignerId,
                        prev_a.jaw_type AS previousJawType,
                        prev_a.sr_no AS previousAlignerNumber,
                        new_a.id AS newAlignerId,
                        new_a.jaw_type AS newJawType,
                        new_a.sr_no AS newAlignerNumber,
                        aa.aligner_id AS alignerIdInTheActionTable,
                        aa.performed_at AS performedAt,
                        CASE
                            WHEN prev_a.end_date > prev_a.change_date THEN
                                -EXTRACT(DAY FROM AGE(prev_a.end_date, prev_a.change_date))
                            WHEN prev_a.end_date < prev_a.change_date THEN
                                EXTRACT(DAY FROM AGE(prev_a.change_date, prev_a.end_date))
                            ELSE
                                0
                        END AS daysDelay
                    FROM aligner a
                    JOIN aligner_journey aj ON aj.id = a.aligner_journey_id
                    JOIN patient p ON p.id = aj.patient_id
                    JOIN tracking t ON t.aligner_journey_id = aj.id
                    LEFT JOIN aligner_action aa ON aa.aligner_id = a.id AND aa.type = 'ALIGNER_CHANGE'
                    LEFT JOIN aligner prev_a ON prev_a.id = CAST(aa.metadata->>'previousAlignerId' AS bigint)
                    LEFT JOIN aligner new_a ON new_a.id = CAST(aa.metadata->>'newAlignerId' AS bigint)
                    WHERE p.id IN :patientIds
                    AND a.change_date >= :startDate
                    AND a.change_date < :endDate
                    AND aa.type = 'ALIGNER_CHANGE'
                    ORDER BY aa.created_at ASC;
                    """)
    List<AlignerChangeDetailsSummary> findAlignerChangeDetailsByPatientIdsAndChangeDateBetween(
            @Param("patientIds") List<Long> patientIds,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

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
        AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED')
    ),
    filtered_patients AS (
        SELECT DISTINCT p.id AS patient_id
        FROM patient p
        JOIN latest_journey lj ON lj.patient_id = p.id AND lj.rn = 1
        JOIN aligner_journey aj ON aj.id = lj.journey_id
        JOIN aligner a ON a.aligner_journey_id = aj.id
            AND a.sr_no = aj.current_aligner_no
        WHERE (
            :filter IS NULL
            OR (
                (:filter = 'AT_RISK' AND a.end_date < CURRENT_DATE AND a.end_date >= CURRENT_DATE - INTERVAL '7 DAY')
                OR (:filter = 'NEED_ATTENTION' AND a.end_date < CURRENT_DATE - INTERVAL '7 DAY')
                OR (:filter = 'ON_TRACK' AND a.end_date >= CURRENT_DATE)
            )
        )
    ),
    invitation_data AS (
        SELECT
            pid.patient_id,
            i.status AS invitation_status,
            i.is_invitation_sent AS is_invitation_sent,
            CASE
                WHEN i.status IS NULL OR i.is_invitation_sent IS NULL THEN 'NOT_CONNECTED'
                WHEN i.status = 5 THEN 'CONNECTED'
                WHEN i.status = 0 AND i.is_invitation_sent = true THEN 'PENDING'
                ELSE 'NOT_CONNECTED'
            END AS app_invite_status
        FROM patient p
        LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
        LEFT JOIN invitation i ON pid.invitation_id = i.id
        WHERE p.id IN (SELECT patient_id FROM filtered_patients)
    ),
    filtered_by_invitation AS (
        SELECT DISTINCT p.id AS patient_id
        FROM patient p
        JOIN invitation_data inv ON inv.patient_id = p.id
        WHERE (
            :invitationStatusFilter IS NULL
            OR inv.app_invite_status = :invitationStatusFilter
        )
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
        AND aj.patient_id IN (SELECT patient_id FROM filtered_by_invitation)
        GROUP BY aj.patient_id
    ),
    all_patient_actions AS (
        SELECT
            aj.patient_id,
            CASE WHEN COUNT(aa.id) > 0 THEN true ELSE false END AS has_performed_actions
        FROM latest_journey lj
        JOIN aligner_journey aj ON aj.id = lj.journey_id
        JOIN aligner a ON a.aligner_journey_id = aj.id
        LEFT JOIN aligner_action aa ON aa.aligner_id = a.id
        WHERE lj.rn = 1
        AND aj.patient_id IN (SELECT patient_id FROM filtered_by_invitation)
        GROUP BY aj.patient_id
    ),
    patients_with_unvalidated_actions AS (
        SELECT patient_id
        FROM unvalidated_actions
        WHERE (
            :isAlignerPendingUpdates IS NULL
            OR :isAlignerPendingUpdates = false
            OR (:isAlignerPendingUpdates = true AND total_unvalidated_actions > 0)
        )
    ),
    pdo_data AS (
        SELECT
            pdo.patient_id,
            u.salutation AS user_salutation,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name
        FROM patient_doctor_organization pdo
        LEFT JOIN user_profile up ON pdo.user_profile_id = up.id
        LEFT JOIN users u ON up.user_id = u.id
        WHERE pdo.patient_id IN (SELECT patient_id FROM filtered_by_invitation)
        AND pdo.patient_id IN (SELECT patient_id FROM patients_with_unvalidated_actions)
    )
    SELECT
        p.id AS patientId,
        p.first_name AS firstName,
        p.last_name AS lastName,
        p.email,
        p.mobile_no AS mobile,
        p.country_code AS countryCode,
        p.profile_picture_url AS profilePictureUrl,
        p.profile_image_id AS profilePictureId,
        p.customer_mapped_id AS customPatientId,
        p.practice_location_name AS practiceLocationName,
        p.practice_location_id AS practiceLocationId,
        aj.id AS alignerJourneyId,
        aj.treatment_type AS treatmentType,
        a.end_date AS alignerEndDate,
        a.jaw_type AS currentAlignerJawType,
        a.sr_no AS currentAlignerNumber,
        (SELECT COUNT(*) FROM aligner WHERE aligner_journey_id = aj.id) AS totalAligners,
        CASE
            WHEN a.end_date < CURRENT_DATE AND a.end_date >= CURRENT_DATE - INTERVAL '7 DAY' THEN 'AT_RISK'
            WHEN a.end_date < CURRENT_DATE - INTERVAL '7 DAY' THEN 'NEED_ATTENTION'
            WHEN a.end_date >= CURRENT_DATE THEN 'ON_TRACK'
            ELSE NULL
        END AS complianceStatus,
        (SELECT COUNT(*) FROM filtered_by_invitation WHERE patient_id IN (SELECT patient_id FROM patients_with_unvalidated_actions)) AS totalPatients,
        COALESCE(ua.unvalidated_checkins, 0) AS unvalidatedCheckins,
        COALESCE(ua.unvalidated_aligner_changes, 0) AS unvalidatedAlignerChanges,
        COALESCE(ua.unvalidated_issue_reports, 0) AS unvalidatedIssueReports,
        COALESCE(ua.total_unvalidated_actions, 0) AS totalUnvalidatedActions,
        COALESCE(apa.has_performed_actions, false) AS hasPerformedActions,
        EXISTS (
            SELECT 1 FROM patient_doctor_organization pdo
            WHERE pdo.patient_id = p.id
            AND pdo.doctor_id = :doctorId
            AND pdo.added_by_user_profile_id = :userProfileId
            AND pdo.organization_id = :organizationId
        ) AS isYourPatient,
        pd.user_salutation AS assignedUserSalutation,
        pd.user_first_name AS assignedUserFirstName,
        pd.user_last_name AS assignedUserLastName,
        COALESCE(inv.invitation_status, 0) AS invitationStatus,
        COALESCE(inv.is_invitation_sent, false) AS isInvitationSent,
        inv.app_invite_status AS appInviteStatus
    FROM patient p
    JOIN filtered_by_invitation fp ON p.id = fp.patient_id
    JOIN patients_with_unvalidated_actions pua ON p.id = pua.patient_id
    JOIN latest_journey lj ON lj.patient_id = p.id AND lj.rn = 1
    JOIN aligner_journey aj ON aj.id = lj.journey_id
    JOIN aligner a ON a.aligner_journey_id = aj.id
        AND a.sr_no = aj.current_aligner_no
    LEFT JOIN unvalidated_actions ua ON ua.patient_id = p.id
    LEFT JOIN all_patient_actions apa ON apa.patient_id = p.id
    LEFT JOIN pdo_data pd ON pd.patient_id = p.id
    LEFT JOIN invitation_data inv ON inv.patient_id = p.id
    ORDER BY p.updated_at DESC
    LIMIT :pageSize OFFSET (:pageNumber * :pageSize)
    """)
    List<PatientAnalyticsSummary> findAnalyticsSummariesByPatientIds(
            @Param("patientIds") Set<Long> patientIds,
            @Param("doctorId") Long doctorId,
            @Param("userProfileId") Long userProfileId,
            @Param("organizationId") Long organizationId,
            @Param("filter") String filter,
            @Param("isAlignerPendingUpdates") Boolean isAlignerPendingUpdates,
            @Param("invitationStatusFilter") String invitationStatusFilter,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

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
        AND aj.progress_status IN ('IN_PROGRESS', 'NOT_STARTED')
    ),
    filtered_patients AS (
        SELECT DISTINCT p.id AS patient_id
        FROM patient p
        JOIN latest_journey lj ON lj.patient_id = p.id AND lj.rn = 1
        JOIN aligner_journey aj ON aj.id = lj.journey_id
        JOIN aligner a ON a.aligner_journey_id = aj.id
        AND a.sr_no = aj.current_aligner_no
        WHERE (
            :filter IS NULL
            OR (
                (:filter = 'AT_RISK' AND a.end_date < CURRENT_DATE AND a.end_date >= CURRENT_DATE - INTERVAL '7 DAY')
                OR (:filter = 'NEED_ATTENTION' AND a.end_date < CURRENT_DATE - INTERVAL '7 DAY')
                OR (:filter = 'ON_TRACK' AND a.end_date >= CURRENT_DATE)
            )
        )
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
                    -- Handle search for full name (first last)
                    POSITION(' ' IN :search) > 0 AND -- Check if search string contains a space
                    LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 1), '%'))
                    AND LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 2), '%'))
                )
                OR (
                     -- Handle search for full name (last first) - added for robustness
                    POSITION(' ' IN :search) > 0 AND -- Check if search string contains a space
                    LOWER(COALESCE(p.last_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 1), '%'))
                    AND LOWER(COALESCE(p.first_name, '')) LIKE LOWER(CONCAT('%', split_part(:search, ' ', 2), '%'))
                )
            )
        )
    ),
    invitation_data AS (
        SELECT
            pid.patient_id,
            i.status AS invitation_status,
            i.is_invitation_sent AS is_invitation_sent,
            CASE
                WHEN i.status IS NULL OR i.is_invitation_sent IS NULL THEN 'NOT_CONNECTED'
                WHEN i.status = 1 THEN 'CONNECTED'
                WHEN i.status = 0 AND i.is_invitation_sent = true THEN 'PENDING'
                ELSE 'NOT_CONNECTED'
            END AS app_invite_status
        FROM patient p
        LEFT JOIN patient_invitation_details pid ON pid.patient_id = p.id
        LEFT JOIN invitation i ON pid.invitation_id = i.id
        WHERE p.id IN (SELECT patient_id FROM filtered_patients)
    ),
    filtered_by_invitation AS (
        SELECT DISTINCT p.id AS patient_id
        FROM patient p
        JOIN invitation_data inv ON inv.patient_id = p.id
        WHERE (
            :invitationStatusFilter IS NULL
            OR inv.app_invite_status = :invitationStatusFilter
        )
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
        AND aj.patient_id IN (SELECT patient_id FROM filtered_by_invitation)
        GROUP BY aj.patient_id
    ),
    all_patient_actions AS (
        SELECT
            aj.patient_id,
            CASE WHEN COUNT(aa.id) > 0 THEN true ELSE false END AS has_performed_actions
        FROM latest_journey lj
        JOIN aligner_journey aj ON aj.id = lj.journey_id
        JOIN aligner a ON a.aligner_journey_id = aj.id
        LEFT JOIN aligner_action aa ON aa.aligner_id = a.id
        WHERE lj.rn = 1
        AND aj.patient_id IN (SELECT patient_id FROM filtered_by_invitation)
        GROUP BY aj.patient_id
    ),
    patients_with_unvalidated_actions AS (
        SELECT patient_id
        FROM unvalidated_actions
        WHERE (
            :isAlignerPendingUpdates IS NULL
            OR :isAlignerPendingUpdates = false
            OR (:isAlignerPendingUpdates = true AND total_unvalidated_actions > 0)
        )
    ),
    pdo_data AS (
        SELECT
            pdo.patient_id,
            u.salutation AS user_salutation,
            u.first_name AS user_first_name,
            u.last_name AS user_last_name
        FROM patient_doctor_organization pdo
        LEFT JOIN user_profile up ON pdo.user_profile_id = up.id
        LEFT JOIN users u ON up.user_id = u.id
        WHERE pdo.patient_id IN (SELECT patient_id FROM filtered_by_invitation)
        AND pdo.patient_id IN (SELECT patient_id FROM patients_with_unvalidated_actions)
    )
    SELECT
        p.id AS patientId,
        p.first_name AS firstName,
        p.last_name AS lastName,
        p.email,
        p.mobile_no AS mobile,
        p.country_code AS countryCode,
        p.profile_picture_url AS profilePictureUrl,
        p.profile_image_id AS profilePictureId,
        p.customer_mapped_id AS customPatientId,
        p.practice_location_name AS practiceLocationName,
        p.practice_location_id AS practiceLocationId,
        aj.id AS alignerJourneyId,
        aj.treatment_type AS treatmentType,
        a.end_date AS alignerEndDate,
        a.jaw_type AS currentAlignerJawType,
        a.sr_no AS currentAlignerNumber,
        (SELECT COUNT(*) FROM aligner WHERE aligner_journey_id = aj.id) AS totalAligners,
        CASE
            WHEN a.end_date < CURRENT_DATE AND a.end_date >= CURRENT_DATE - INTERVAL '7 DAY' THEN 'AT_RISK'
            WHEN a.end_date < CURRENT_DATE - INTERVAL '7 DAY' THEN 'NEED_ATTENTION'
            WHEN a.end_date >= CURRENT_DATE THEN 'ON_TRACK'
            ELSE NULL
        END AS complianceStatus,
        (SELECT COUNT(*) FROM filtered_by_invitation WHERE patient_id IN (SELECT patient_id FROM patients_with_unvalidated_actions)) AS totalPatients,
        COALESCE(ua.unvalidated_checkins, 0) AS unvalidatedCheckins,
        COALESCE(ua.unvalidated_aligner_changes, 0) AS unvalidatedAlignerChanges,
        COALESCE(ua.unvalidated_issue_reports, 0) AS unvalidatedIssueReports,
        COALESCE(ua.total_unvalidated_actions, 0) AS totalUnvalidatedActions,
        COALESCE(apa.has_performed_actions, false) AS hasPerformedActions,
        EXISTS (
            SELECT 1 FROM patient_doctor_organization pdo
            WHERE pdo.patient_id = p.id
            AND pdo.doctor_id = :doctorId
            AND pdo.added_by_user_profile_id = :userProfileId
            AND pdo.organization_id = :organizationId
        ) AS isYourPatient,
        pd.user_salutation AS assignedUserSalutation,
        pd.user_first_name AS assignedUserFirstName,
        pd.user_last_name AS assignedUserLastName,
        COALESCE(inv.invitation_status, 0) AS invitationStatus,
        COALESCE(inv.is_invitation_sent, false) AS isInvitationSent,
        inv.app_invite_status AS appInviteStatus
    FROM patient p
    JOIN filtered_by_invitation fp ON p.id = fp.patient_id
    JOIN patients_with_unvalidated_actions pua ON p.id = pua.patient_id
    JOIN latest_journey lj ON lj.patient_id = p.id AND lj.rn = 1
    JOIN aligner_journey aj ON aj.id = lj.journey_id
    JOIN aligner a ON a.aligner_journey_id = aj.id
        AND a.sr_no = aj.current_aligner_no
    LEFT JOIN unvalidated_actions ua ON ua.patient_id = p.id
    LEFT JOIN all_patient_actions apa ON apa.patient_id = p.id
    LEFT JOIN pdo_data pd ON pd.patient_id = p.id
    LEFT JOIN invitation_data inv ON inv.patient_id = p.id
    ORDER BY p.updated_at DESC
    LIMIT :pageSize OFFSET (:pageNumber * :pageSize)
    """)
    List<PatientAnalyticsSummary> findAnalyticsSummariesWithSearch(
            @Param("patientIds") Set<Long> patientIds,
            @Param("filter") String filter,
            @Param("search") String search,
            @Param("doctorId") Long doctorId,
            @Param("userProfileId") Long userProfileId,
            @Param("organizationId") Long organizationId,
            @Param("isAlignerPendingUpdates") Boolean isAlignerPendingUpdates,
            @Param("invitationStatusFilter") String invitationStatusFilter,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

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
                    filtered_patients AS (
                        SELECT DISTINCT p.id AS patient_id
                        FROM patient p
                        JOIN patients_with_actions pwa ON p.id = pwa.patient_id
                        JOIN latest_journey lj ON lj.patient_id = p.id AND lj.rn = 1
                        JOIN aligner_journey aj ON aj.id = lj.journey_id
                        JOIN aligner a ON a.aligner_journey_id = aj.id
                            AND a.sr_no = aj.current_aligner_no
                        WHERE (
                            :filter IS NULL OR :filter = 'ALL'
                            OR (
                                (:filter = 'AT_RISK' AND a.end_date < CURRENT_DATE AND a.end_date >= CURRENT_DATE - INTERVAL '7 DAY')
                                OR (:filter = 'NEED_ATTENTION' AND a.end_date < CURRENT_DATE - INTERVAL '7 DAY')
                                OR (:filter = 'ON_TRACK' AND a.end_date >= CURRENT_DATE)
                            )
                        )
                    )
                    SELECT
                        p.id AS patientId,
                        CASE
                            WHEN p.last_name IS NULL OR p.last_name = '' THEN p.first_name
                            ELSE CONCAT(p.first_name, ' ', p.last_name)
                        END AS patientFullName,
                        p.profile_picture_url AS patientProfileUrl
                    FROM patient p
                    JOIN filtered_patients fp ON p.id = fp.patient_id
                    """)
    List<PatientRemindAllForAnalyticsSummary> findPatientsForRemindAll(
            @Param("patientIds") Set<Long> patientIds, @Param("filter") String filter);
}
