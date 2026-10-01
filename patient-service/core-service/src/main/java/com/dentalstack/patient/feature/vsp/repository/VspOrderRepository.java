package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.doctor.projection.PlanningPracticeCounts;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.vsp.dto.summary.VspOrderIdAndStatus;
import com.dentalstack.patient.feature.vsp.entity.VspOrder;
import feign.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface VspOrderRepository extends JpaRepository<VspOrder, String> {

    Page<VspOrder> findAllByPatientId(Long patientId, Pageable pageable);

    @Query(
            """
            SELECT o.id as id, o.status as status
            FROM VspOrder o
            WHERE o.patient.id = :patientId
                AND o.status != 'ARCHIVED'
                AND o.status != 'DRAFT'
            ORDER BY o.createdAt DESC
            LIMIT 1
            """)
    Optional<VspOrderIdAndStatus> findLatestActiveVspOrderByPatientExcludingDraft(@Param("patientId") Long patientId);

    @Query(
            """
            SELECT o.id as id, o.status as status
            FROM VspOrder o
            WHERE o.patient.id = :patientId
                AND o.status != 'ARCHIVED'
            ORDER BY o.createdAt DESC
            LIMIT 1
            """)
    Optional<VspOrderIdAndStatus> findLatestActiveVspOrderByPatientIncludingDraft(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
            WITH latest_non_draft_orders AS (
                SELECT DISTINCT ON (o.patient_id) o.id, o.status, o.created_at, o.patient_id
                FROM vsp_order o
                WHERE o.created_by_user_profile_id = :profileId
                  AND o.status != 'DRAFT'
                ORDER BY o.patient_id, o.created_at DESC
            ),
            draft_orders AS (
                SELECT DISTINCT ON (o.patient_id) o.id, o.status, o.created_at, o.patient_id
                FROM vsp_order o
                WHERE o.created_by_user_profile_id = :profileId
                ORDER BY o.patient_id, o.created_at DESC
            ),
            no_order_patients AS (
                SELECT pdo.patient_id
                FROM patient_doctor_organization pdo
                WHERE pdo.user_profile_id = :profileId
                  AND NOT EXISTS (
                      SELECT 1 FROM vsp_order o WHERE o.patient_id = pdo.patient_id
                  )
            ),
            all_orders_for_date AS (
                SELECT created_at
                FROM vsp_order o
                WHERE o.created_by_user_profile_id = :profileId
            )
            SELECT
                -- Active cases: Need Info, In Progress, In Review, Request Revision, Approved
                COUNT(CASE WHEN lo.status IN ('NEED_MORE_INFO', 'IN_PROGRESS', 'ORDERED', 'IN_REVIEW', 'REQUEST_REVISION', 'APPROVED') THEN 1 END) AS active,

                -- Draft: latest order is DRAFT + patients with NO vsp orders at all
                (
                    SELECT COUNT(*) FROM draft_orders WHERE status = 'DRAFT'
                ) + (
                    SELECT COUNT(*) FROM no_order_patients
                ) AS draft,

                -- Need Info
                COUNT(CASE WHEN lo.status = 'NEED_MORE_INFO' THEN 1 END) AS needInfo,

                -- In Progress
                COUNT(CASE WHEN lo.status IN ('IN_PROGRESS', 'ORDERED') THEN 1 END) AS inProgress,

                -- In Review
                COUNT(CASE WHEN lo.status = 'IN_REVIEW' THEN 1 END) AS inReview,

                -- In Revision (REQUEST_REVISION is the VSP equivalent of RE_PLAN)
                COUNT(CASE WHEN lo.status = 'REQUEST_REVISION' THEN 1 END) AS inRevision,

                -- Approved (including STL file states)
                COUNT(CASE WHEN lo.status IN ('APPROVED', 'STL_FILES_REQUESTED', 'STL_FILES_UPLOADED') THEN 1 END) AS approved,

                -- Completed
                COUNT(CASE WHEN lo.status = 'COMPLETED' THEN 1 END) AS completed,

                -- Cases this month
                COUNT(CASE WHEN EXTRACT(MONTH FROM lo.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
                            AND EXTRACT(YEAR FROM lo.created_at) = EXTRACT(YEAR FROM CURRENT_DATE) THEN 1 END) AS casesThisMonth,

                -- Cases last month
                COUNT(CASE WHEN EXTRACT(MONTH FROM lo.created_at) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
                            AND EXTRACT(YEAR FROM lo.created_at) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month') THEN 1 END) AS casesLastMonth,

                -- Latest activity date from all vsp orders
                (SELECT MAX(created_at) FROM all_orders_for_date) AS lastActivityDate

            FROM latest_non_draft_orders lo
            """,
            nativeQuery = true)
    PlanningPracticeCounts getVspPlanningPracticeCounts(@Param("profileId") Long profileId);

    @Query(
            """
            SELECT DISTINCT o.id
            FROM VspOrder o
            WHERE o.patient.id = :patientId
                AND o.status = 'ARCHIVED'
            """)
    List<String> findArchivedVspOrderIdsByPatient(@Param("patientId") Long patientId);

    @Query("SELECT u FROM VspOrder v " + "JOIN v.assignedToUserProfile u "
            + "WHERE v.patient.id = :patientId "
            + "AND v.createdByUserProfile.id = :profileId "
            + "ORDER BY v.createdAt DESC")
    List<UserProfile> findLatestAssignedToUserProfileByPatientIdAndCreatedByProfileId(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId, Pageable pageable);

    @Query(
            """
    SELECT o.assignedToUserProfile FROM VspOrder o
    JOIN o.assignedToUserProfile atup
    JOIN FETCH atup.user u
    WHERE o.patient.id = :patientId
    AND o.createdByUserProfile.id = :profileId
    ORDER BY o.createdAt DESC
    LIMIT 1
""")
    Optional<UserProfile> findLatestTargetProfileByPatientIdAndOwnerProfileId(Long patientId, Long profileId);

    @Query(
            value =
                    """
    SELECT COUNT(DISTINCT o.patient_id)
    FROM vsp_order o
    WHERE (o.assigned_to_user_profile_id = :userProfileId OR o.created_by_user_profile_id = :userProfileId)
    AND o.status <> 'DRAFT'
    """,
            nativeQuery = true)
    int findCountByProfileId(@Param("userProfileId") Long userProfileId);

    @Query(
            """
    SELECT o FROM VspOrder o
    WHERE o.assignedToUserProfile.id = :profileId
        AND o.createdByUserProfile.id = :customerProfileId
                AND o.status != 'DRAFT'
""")
    Page<VspOrder> findOrdersForDashboard(
            @Param("customerProfileId") Long customerProfileId, @Param("profileId") Long profileId, Pageable pageable);

    @Query(
            """
    SELECT COUNT(o) FROM VspOrder o
    WHERE o.assignedToUserProfile.id = :profileId
    AND o.createdByUserProfile.id = :customerProfileId
        AND o.status != 'DRAFT'
        """)
    Long countByAssignedToUserProfileId(
            @Param("customerProfileId") Long customerProfileId, @Param("profileId") Long profileId);

    @Query(
            """
    SELECT MAX(o.createdAt) FROM VspOrder o
    WHERE o.assignedToUserProfile.id = :profileId
    AND o.createdByUserProfile.id = :customerProfileId
""")
    LocalDateTime findLastOrderDate(
            @Param("customerProfileId") Long customerProfileId, @Param("profileId") Long profileId);

    @Query(
            """
    SELECT DISTINCT o.patient.id
    FROM VspOrder o
    WHERE (o.assignedToUserProfile.id = :assignedLabUserId
           OR o.createdByUserProfile.id = :assignedLabUserId)
    AND (:search IS NULL OR :search = '' OR (
        LOWER(o.patient.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(o.patient.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(o.patient.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(o.patient.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(CONCAT(o.patient.firstName, ' ', o.patient.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
    ))
""")
    List<Long> findPatientIdByAssignedLabUserIdWithSearch(
            @Param("assignedLabUserId") Long assignedLabUserId, @Param("search") String search);

    @Query("""
    SELECT o FROM VspOrder o
    WHERE o.patient.id = :patientId
    ORDER BY o.createdAt DESC
    """)
    List<VspOrder> findAllOrderByPatientId(@Param("patientId") Long patientId);
}
