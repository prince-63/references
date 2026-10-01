package com.dentalstack.patient.feature.order.repository;

import com.dentalstack.patient.feature.doctor.projection.PlanningPracticeCounts;
import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.order.enums.OrderType;
import com.dentalstack.patient.feature.order.projection.OrderCountSummary;
import com.dentalstack.patient.feature.order.projection.OrderSummary;
import com.dentalstack.patient.feature.order.projection.PatientOrderCountResult;
import com.dentalstack.patient.feature.order.projection.PatientOrderSummaryResult;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByDoctorIdAndProfileIdAndOrganizationId(Long doctorId, Long profileId, Long organizationId);

    Optional<Order> findTop1ByPatientIdOrderByCreatedAtDesc(Long patientId);

    List<Order> findByAssignedLabUserIdAndOrganizationId(Long assignedLabUserId, Long organizationId);

    List<Order> findByAssignedLabUserId(Long assignedLabUserId);

    List<Order> findByTargetProfile_IdAndOrganizationId(Long targetProfileId, Long organizationId);

    List<Order> findByProfileIdAndOrganizationId(Long targetProfileId, Long organizationId);

    @Query(
            """
            SELECT DISTINCT o.id
            FROM Order o
            WHERE o.assignedLabUserId IN :profileIds
              AND o.organizationId = :organizationId
              AND o.status <> :status
            """)
    Set<String> findDistinctOrderIdsByAssignedLabUserIdsAndOrganizationIdAndStatusNot(
            @Param("profileIds") List<Long> profileIds,
            @Param("organizationId") Long organizationId,
            @Param("status") OrderStatus status);

    @Query(
            """
            SELECT DISTINCT o.id
            FROM Order o
            WHERE o.profileId IN :profileIds
              AND o.organizationId = :organizationId
              AND EXISTS (
                    SELECT 1
                    FROM UserProfile up
                    WHERE up.id = o.profileId
                      AND up.doctor.id = o.doctorId
              )
            """)
    Set<String> findDistinctOrderIdsByProfileIdsAndOrganizationId(
            @Param("profileIds") List<Long> profileIds, @Param("organizationId") Long organizationId);

    @Query(
            """
            SELECT DISTINCT o.id
            FROM Order o
            WHERE o.profileId IN :profileIds
              AND o.organizationId = :organizationId
              AND o.status <> :status
              AND EXISTS (
                    SELECT 1
                    FROM UserProfile up
                    WHERE up.id = o.profileId
                      AND up.doctor.id = o.doctorId
              )
            """)
    Set<String> findDistinctOrderIdsByProfileIdsAndOrganizationIdAndStatusNot(
            @Param("profileIds") List<Long> profileIds,
            @Param("organizationId") Long organizationId,
            @Param("status") OrderStatus status);

    @Query(
            "SELECT o.patient.id AS patientId FROM Order o WHERE o.assignedLabUserId = :assignedLabUserId AND o.organizationId = :organizationId")
    Set<Long> findPatientIdByAssignedLabUserIdAndOrganizationId(Long assignedLabUserId, Long organizationId);

    @Query("SELECT o.patient.id FROM Order o WHERE o.assignedLabUserId = :assignedLabUserId "
            + "OR o.ownerProfile.id = :assignedLabUserId "
            + "OR o.targetProfile.id = :assignedLabUserId")
    List<Long> findPatientIdByAssignedLabUserId(Long assignedLabUserId);

    @Query("SELECT o.patient.id AS patientId FROM Order o WHERE o.organizationId = :organizationId")
    Set<Long> findPatientIdByLabId(Long organizationId);

    @Query(
            """
    SELECT o FROM Order o
    LEFT JOIN FETCH o.patient p
    LEFT JOIN FETCH o.prescription
    LEFT JOIN FETCH o.serviceProduct sp
    LEFT JOIN FETCH p.doctorOrganization pdo
    LEFT JOIN FETCH pdo.userProfile up
    LEFT JOIN FETCH up.user u
    LEFT JOIN FETCH o.childOrder co
    LEFT JOIN FETCH o.parentOrder po
    LEFT JOIN FETCH o.targetProfile tp
    LEFT JOIN FETCH tp.user tup
    LEFT JOIN FETCH o.ownerProfile op
    LEFT JOIN FETCH op.user opu
    LEFT JOIN FETCH op.doctorBilling opdb
    LEFT JOIN FETCH tp.doctorBilling tpdb
    LEFT JOIN FETCH o.manufacturingBatches mb
    LEFT JOIN FETCH mb.treatmentPlan tp2
    WHERE o.id = :orderId
    """)
    Optional<Order> findByIdWithPatientAndDoctorOrganizationAndUser(@Param("orderId") String orderId);

    @Query("""
    SELECT o FROM Order o
    WHERE o.id = :orderId
    """)
    Optional<Order> findByOrderId(@Param("orderId") String orderId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.ownerProfile.id = :profileId")
    long countSentOrdersByProfileId(@Param("profileId") Long profileId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.targetProfile.id = :profileId AND o.status != 'DRAFT'")
    long countReceivedOrdersByProfileId(@Param("profileId") Long profileId);

    @Query(
            "SELECT COUNT(o) FROM Order o WHERE o.targetProfile.id = :profileId AND o.status != 'DRAFT'  AND EXISTS ( SELECT 1 FROM o.ownerProfile.roles r WHERE r.name IN :roles)")
    long countReceivedOrdersByProfileIdAndRoles(@Param("profileId") Long profileId, List<String> roles);

    @Query(
            "SELECT COUNT(o) FROM Order o WHERE o.assignedLabUserId = :profileId AND o.status != 'DRAFT'  AND EXISTS ( SELECT 1 FROM o.ownerProfile.roles r WHERE r.name IN :roles)")
    long countReceivedOrdersForLabStaffByProfileIdAndRoles(@Param("profileId") Long profileId, List<String> roles);

    @Query(
            """
            SELECT DISTINCT o.patient.id FROM Order o
            JOIN o.targetProfile tp
            WHERE tp.id = :profileId AND o.status != 'DRAFT'
        """)
    Set<Long> findPatientIdsFromReceivedOrdersByProfileId(@Param("profileId") Long profileId);

    @Query(
            """
        SELECT
            COUNT(o) as totalCount,
            COUNT(DISTINCT o.patient.id) as totalPatientCount,
            SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
            SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
            SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
            SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
            SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
            SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
            SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
            SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
            SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
            SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
            SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
            SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
            SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
            SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
            SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
            SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
            SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
            SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount,
            SUM(CASE WHEN o.dueBy IS NULL THEN 1 ELSE 0 END) as notAddedDueByCount
        FROM Order o
        WHERE o.targetProfile.id = :profileId AND o.status != 'DRAFT'
    """)
    OrderCountSummary getReceivedOrdersCountSummary(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate);

    @Query(
            """
            SELECT
                COUNT(o) as totalCount,
                COUNT(DISTINCT o.patient.id) as totalPatientCount,
                SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
                SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
                SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
                SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
                SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
                SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
                SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
                SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
                SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
                SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
                SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
                SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
                SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
                SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
                SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
                SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount,
                SUM(CASE WHEN o.dueBy IS NULL THEN 1 ELSE 0 END) as notAddedDueByCount,
                SUM(CASE
                    WHEN o.status = 'COMPLETED'
                    AND NOT EXISTS (
                        SELECT 1 FROM ManufacturingBatch mb
                        WHERE mb.order.id = o.id
                    )
                    THEN 1 ELSE 0
                END) as manufacturingPendingCount
            FROM Order o
            WHERE o.targetProfile.id = :profileId
            AND o.status != 'DRAFT'
            AND EXISTS (
                SELECT 1 FROM o.ownerProfile.roles r
                WHERE r.name IN :roles
            )
            """)
    OrderCountSummary getReceivedOrdersCountSummaryByRoles(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT
                COUNT(o) as totalCount,
                COUNT(DISTINCT o.patient.id) as totalPatientCount,
                SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
                SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
                SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
                SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
                SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
                SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
                SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
                SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
                SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
                SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
                SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
                SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
                SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
                SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
                SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
                SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount,
                SUM(CASE WHEN o.dueBy IS NULL THEN 1 ELSE 0 END) as notAddedDueByCount
            FROM Order o
            WHERE o.ownerProfile.id = :profileId
            AND EXISTS (
                SELECT 1 FROM o.ownerProfile.roles r
                WHERE r.name IN :roles
            )
        """)
    OrderCountSummary getReceivedOrdersCountSummaryForPracticeCustomerByRoles(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate,
            @Param("roles") List<String> roles);

    @Query(
            """
    SELECT
        COUNT(o) as totalCount,
        COUNT(DISTINCT o.patient.id) as totalPatientCount,
        SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
        SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
        SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
        SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
        SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
        SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
        SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
        SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
        SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
        SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
        SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
        SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
        SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
        SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
        SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
        SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
        SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
        SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount,
        SUM(CASE WHEN o.dueBy IS NULL THEN 1 ELSE 0 END) as notAddedDueByCount,
        COUNT(DISTINCT o.patient.id) as uniquePatientCount,
        SUM(CASE
            WHEN o.status = 'COMPLETED'
            AND NOT EXISTS (
                SELECT 1 FROM ManufacturingBatch mb
                WHERE mb.order.id = o.id
            )
            THEN 1 ELSE 0
        END) as manufacturingPendingCount
    FROM Order o
    WHERE o.ownerProfile.id = :profileId
""")
    OrderCountSummary getSentOrdersCountSummary(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate);

    @Query(
            """
        SELECT
            COUNT(o) as totalCount,
            COUNT(DISTINCT o.patient.id) as totalPatientCount,
            SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
            SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
            SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
            SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
            SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
            SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
            SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
            SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
            SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
            SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
            SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
            SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
            SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
            SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
            SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
            SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
            SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
            SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount
        FROM Order o
        WHERE o.assignedLabUserId = :profileId AND o.status != 'DRAFT'
    """)
    OrderCountSummary getLabStaffOrdersCountSummary(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate);

    @Query(
            """
            SELECT
                COUNT(o) as totalCount,
                COUNT(DISTINCT o.patient.id) as totalPatientCount,
                SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
                SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
                SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
                SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
                SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
                SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
                SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
                SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
                SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
                SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
                SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
                SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
                SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
                SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
                SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
                SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount
            FROM Order o
            WHERE o.assignedLabUserId = :profileId
            AND o.status != 'DRAFT'
            AND EXISTS (
                SELECT 1 FROM o.ownerProfile.roles r
                WHERE r.name IN :roles
            )
        """)
    OrderCountSummary getLabStaffOrdersCountSummaryForRoles(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate,
            @Param("roles") List<String> roles);

    @Query(
            """
        SELECT
            COUNT(o) as totalCount,
            COUNT(DISTINCT o.patient.id) as totalPatientCount,
            SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
            SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
            SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
            SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
            SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
            SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
            SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
            SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
            SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
            SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
            SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
            SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
            SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
            SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
            SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
            SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
            SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
            SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount
        FROM Order o
        WHERE (o.ownerProfile.id = :profileId OR o.targetProfile.id = :profileId)
          AND o.assignedLabUserId IS NOT NULL
          AND o.status != 'DRAFT'
    """)
    OrderCountSummary getAssignedOrders(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate);

    @Query(
            """
    SELECT
        COUNT(CASE WHEN o.ownerProfile.id = :profileId THEN 1 END) AS sentCount,
        COUNT(CASE WHEN o.targetProfile.id = :profileId AND o.status != 'DRAFT' THEN 1 END) AS receivedCount
    FROM Order o
    WHERE o.createdAt >= :start AND o.createdAt < :end
""")
    OrderCountSummary getSentAndReceivedOrderCounts(
            @Param("profileId") Long profileId, @Param("start") ZonedDateTime start, @Param("end") ZonedDateTime end);

    @Query(
            """
    SELECT
        COUNT(CASE WHEN o.ownerProfile.id = :profileId THEN 1 END) AS sentCount,
        COUNT(CASE WHEN o.targetProfile.id = :profileId AND o.status != 'DRAFT' THEN 1 END) AS receivedCount
    FROM Order o
    WHERE o.ownerProfile.id = :profileId OR o.targetProfile.id = :profileId
""")
    OrderCountSummary countsOfReceivedAndSentOrders(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT
        COUNT(CASE WHEN o.owner_profile_id = :profileId THEN 1 END) AS sentCount,
        COUNT(CASE WHEN o.target_profile_id = :profileId AND o.status != 'DRAFT' THEN 1 END) AS receivedCount
    FROM orders o
    JOIN user_profile up ON o.owner_profile_id = up.id
    JOIN user_profile_role upr ON up.id = upr.user_profile_id
    JOIN role r ON upr.role_id = r.id
    WHERE o.created_at >= :start
      AND o.created_at < :end
      AND  r.name = :roleName
    """,
            nativeQuery = true)
    OrderCountSummary getSentAndReceivedOrderCountsByRole(
            @Param("profileId") Long profileId,
            @Param("start") ZonedDateTime start,
            @Param("end") ZonedDateTime end,
            @Param("roleName") String roleName);

    @Query(
            value = "SELECT COUNT(*) FROM orders o WHERE o.patient_id = :patientId AND o.owner_profile_id = :profileId",
            nativeQuery = true)
    long countSentOrdersByPatientId(Long patientId, Long profileId);

    @Query(
            value =
                    "SELECT COUNT(*) FROM orders o WHERE o.patient_id = :patientId AND o.target_profile_id = :profileId AND o.status != 'DRAFT'",
            nativeQuery = true)
    long countReceivedOrdersByPatientId(Long patientId, Long profileId);

    @Query(
            value =
                    "SELECT COUNT(*) FROM orders o WHERE o.patient_id = :patientId AND o.assigned_lab_user_id = :profileId",
            nativeQuery = true)
    long countOrdersByPatientIdForLabStaff(Long patientId, Long profileId);

    @Query(
            value =
                    """
    SELECT
        COALESCE(db.company_brand_name,
            CONCAT_WS(' ', u.salutation, u.first_name, u.last_name)) AS customer_name
    FROM orders o
    LEFT JOIN user_profile op ON o.owner_profile_id = op.id
    LEFT JOIN doctor_billing db ON op.doctor_billing_id = db.id
    LEFT JOIN users u ON op.user_id = u.id
    WHERE o.patient_id = :patientId
    AND o.owner_profile_id = :profileId
    ORDER BY o.created_at DESC
    LIMIT 1
    """,
            nativeQuery = true)
    String findLatestCustomerNameByPatientIdAndProfileIdSentOrder(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT
        COALESCE(db.company_brand_name,
            CONCAT_WS(' ', u.salutation, u.first_name, u.last_name)) AS customer_name
    FROM orders o
    LEFT JOIN user_profile op ON o.owner_profile_id = op.id
    LEFT JOIN doctor_billing db ON op.doctor_billing_id = db.id
    LEFT JOIN users u ON op.user_id = u.id
    WHERE o.patient_id = :patientId
    AND o.target_profile_id = :profileId
    ORDER BY o.created_at DESC
    LIMIT 1
    """,
            nativeQuery = true)
    String findLatestCustomerNameByPatientIdAndProfileIdReceivedOrder(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT
        COALESCE(db.company_brand_name,
            CONCAT_WS(' ', u.salutation, u.first_name, u.last_name)) AS customer_name
    FROM orders o
    LEFT JOIN user_profile op ON o.owner_profile_id = op.id
    LEFT JOIN doctor_billing db ON op.doctor_billing_id = db.id
    LEFT JOIN users u ON op.user_id = u.id
    WHERE o.patient_id = :patientId
    AND o.assigned_lab_user_id = :profileId
    ORDER BY o.created_at DESC
    LIMIT 1
    """,
            nativeQuery = true)
    String findLatestCustomerNameByPatientIdAndProfileIdLabStaffOrder(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT
        COUNT(*) AS totalCount,
        SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) AS orderedCount,
        SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressCount,
        SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) AS inReviewCount,
        SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) AS onHoldCount,
        SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) AS rePlanCount,
        SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) AS approvedCount,
        SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedCount,
        SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) AS draftCount,
        SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelledCount,
        SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
        SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) AS stlFilesRequestedCount,
        SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) AS stlFilesUploadedCount,
        SUM(CASE WHEN o.created_at >= :today THEN 1 ELSE 0 END) AS newOrdersCount,
        SUM(CASE WHEN o.assigned_lab_user_id IS NULL THEN 1 ELSE 0 END) AS unassignedOrdersCount,
        SUM(CASE WHEN o.is_urgent = TRUE THEN 1 ELSE 0 END) AS urgentOrdersCount,
        SUM(CASE WHEN o.assigned_lab_user_id = :profileId THEN 1 ELSE 0 END) AS assignedToMeCount,
        SUM(CASE WHEN o.due_by = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) AS dueTodayCount,
        SUM(CASE WHEN o.due_by < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) AS overdueCount,
        SUM(CASE WHEN o.due_by IS NULL THEN 1 ELSE 0 END) as notAddedDueByCount
    FROM orders o
    JOIN user_profile up ON o.owner_profile_id = up.id
    JOIN user_profile_role upr ON up.id = upr.user_profile_id
    JOIN role r ON upr.role_id = r.id
    WHERE o.assigned_lab_user_id = :profileId
      AND o.status != 'DRAFT'
      AND r.name IN (:roles)
    """,
            nativeQuery = true)
    OrderCountSummary getLabStaffOrdersCountSummaryFilterByRoles(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate,
            @Param("roles") List<String> roles);

    List<Order> findByPatientId(Long patientId);

    @Query("SELECT o FROM Order o " + "LEFT JOIN FETCH o.ownerProfile op "
            + "LEFT JOIN FETCH o.shippingDetails sd "
            + "WHERE o.patient.id = :patientId "
            + "AND o.ownerProfile.id = :profileId")
    List<Order> findByPatientIdWhereProfileIdEqualsOwnerProfileId(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query(
            value = "SELECT o.id as orderId, " + "o.status as orderStatus, "
                    + "COUNT(tp.id) as treatmentPlanCount "
                    + "FROM orders o "
                    + "LEFT JOIN treatment_plan tp ON tp.linked_order_id = o.id "
                    + "WHERE o.patient_id = :patientId "
                    + "AND o.owner_profile_id = :profileId "
                    + "AND o.parent_order_id IS NOT NULL "
                    + "GROUP BY o.id, o.status, o.created_at "
                    + "ORDER BY o.created_at DESC "
                    + "LIMIT 1",
            nativeQuery = true)
    Optional<OrderSummary> findLatestPurchaseOrderSummaryByPatientIdWhereProfileIdEqualsOwnerProfileIdNative(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query(
            """
        SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END
        FROM Order o
        WHERE o.patient.id = :patientId
        AND (
            (o.ownerProfile IS NOT NULL AND o.ownerProfile.id IN :profileIds) OR
            (o.targetProfile IS NOT NULL AND o.targetProfile.id IN :profileIds) OR
            (o.assignedLabUserId IS NOT NULL AND o.assignedLabUserId IN :profileIds) OR
            o.profileId IN :profileIds
        )
        """)
    boolean existsOrderWithPatientAndProfilesWithNullCheck(
            @Param("patientId") Long patientId, @Param("profileIds") List<Long> profileIds);

    @Query(
            """
        SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END
        FROM Order o
        WHERE o.patient.id = :patientId
        AND (
            (o.ownerProfile IS NOT NULL AND o.ownerProfile.id = :profileId) OR
            (o.targetProfile IS NOT NULL AND o.targetProfile.id = :profileId) OR
            (o.assignedLabUserId IS NOT NULL AND o.assignedLabUserId = :profileId) OR
            o.profileId = :profileId
        )
        """)
    boolean existsOrderWithPatientAndProfileWithNullCheck(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query("SELECT DISTINCT o.patient.id FROM Order o WHERE o.targetProfile.id = :targetProfileId")
    List<Long> findDistinctPatientIdsByTargetProfileId(@Param("targetProfileId") Long targetProfileId);

    @Query(
            """
            SELECT
                o.patient.id as patientId,
                COUNT(o.id) as orderCount
            FROM Order o
            WHERE o.patient.id IN :patientIds
            AND o.targetProfile.id = :targetProfileId
            AND o.status != 'DRAFT'
            AND EXISTS (
                SELECT 1 FROM o.ownerProfile.roles r
                WHERE r.name IN :roles
            )
            GROUP BY o.patient.id
        """)
    List<PatientOrderCountResult> getOrderCountsByPatientIds(
            @Param("patientIds") List<Long> patientIds,
            @Param("targetProfileId") Long targetProfileId,
            @Param("roles") List<String> roles);

    @Query(
            value = "WITH LatestOrders AS ("
                    + "   SELECT o.id as order_id, o.patient_id, o.status, o.owner_profile_id, o.created_at, "
                    + "          ROW_NUMBER() OVER (PARTITION BY o.patient_id ORDER BY o.created_at DESC) as rn "
                    + "   FROM orders o "
                    + "   JOIN patient p ON o.patient_id = p.id "
                    + "   JOIN patient_doctor_organization pdo ON p.id = pdo.patient_id "
                    + "   JOIN user_profile up ON pdo.user_profile_id = up.id "
                    + "   WHERE o.patient_id IN :patientIds "
                    + "   AND o.owner_profile_id = up.id "
                    + ") "
                    + "SELECT order_id as orderId, patient_id as patientId, status as orderStatus "
                    + "FROM LatestOrders "
                    + "WHERE rn = 1",
            nativeQuery = true)
    List<OrderSummary> findLatestOrdersForPatients(@Param("patientIds") List<Long> patientIds);

    @Query(
            value = "SELECT o.status "
                    + "FROM orders o "
                    + "WHERE o.patient_id = :patientId "
                    + "ORDER BY o.created_at DESC "
                    + "LIMIT 1",
            nativeQuery = true)
    Optional<String> findLatestOrderStatusForPatient(@Param("patientId") Long patientId);

    @Query(
            value = "SELECT o.id "
                    + "FROM orders o "
                    + "WHERE o.patient_id = :patientId "
                    + "ORDER BY o.created_at DESC "
                    + "LIMIT 1",
            nativeQuery = true)
    Optional<String> findLatestOrderIdForPatient(@Param("patientId") Long patientId);

    @Query(
            "SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END FROM Order o WHERE o.patient.id = :patientId AND o.status != :draftStatus")
    boolean existsOrdersWithNonDraftStatus(
            @Param("patientId") Long patientId, @Param("draftStatus") OrderStatus draftStatus);

    List<Order> findByPrescription(Prescription existingPrescription);

    @Query(
            """
            SELECT
                COUNT(o) as totalCount,
                COUNT(DISTINCT o.patient.id) as totalPatientCount,
                SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) as orderedCount,
                SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
                SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) as inReviewCount,
                SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) as onHoldCount,
                SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) as rePlanCount,
                SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
                SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
                SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) as draftCount,
                SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) as needMoreInfoCount,
                SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
                SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) as stlFilesRequestedCount,
                SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) as stlFilesUploadedCount,
                SUM(CASE WHEN o.createdAt >= :today THEN 1 ELSE 0 END) as newOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) as unassignedOrdersCount,
                SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) as urgentOrdersCount,
                SUM(CASE WHEN o.assignedLabUserId = :profileId THEN 1 ELSE 0 END) as assignedToMeCount,
                SUM(CASE WHEN o.dueBy = :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as dueTodayCount,
                SUM(CASE WHEN o.dueBy < :currentDate AND o.status NOT IN ('CANCELLED', 'COMPLETED') THEN 1 ELSE 0 END) as overdueCount,
                SUM(CASE WHEN o.dueBy IS NULL THEN 1 ELSE 0 END) as notAddedDueByCount,
                COUNT(DISTINCT o.patient.id) as uniquePatientCount,
                SUM(CASE
                    WHEN o.status = 'COMPLETED'
                    AND NOT EXISTS (
                        SELECT 1 FROM ManufacturingBatch mb
                        WHERE mb.order.id = o.id
                    )
                    THEN 1 ELSE 0
                END) as manufacturingPendingCount
            FROM Order o
            WHERE (o.ownerProfile.id = :profileId
                   OR (o.targetProfile.id = :profileId AND o.status != 'DRAFT'))
            """)
    OrderCountSummary getCombinedOrdersCountSummary(
            @Param("profileId") Long profileId,
            @Param("today") ZonedDateTime today,
            @Param("currentDate") LocalDate currentDate);

    @Query(
            """
        SELECT o.orderType
        FROM Order o
        WHERE o.patient.id = :patientId
        AND (
            (o.ownerProfile IS NOT NULL AND o.ownerProfile.id = :profileId) OR
            (o.targetProfile IS NOT NULL AND o.targetProfile.id = :profileId) OR
            (o.createdByProfile IS NOT NULL AND o.createdByProfile.id = :profileId) OR
            (o.assignedLabUserId IS NOT NULL AND o.assignedLabUserId = :profileId) OR
            o.profileId = :profileId
        )
        ORDER BY o.createdAt DESC
        LIMIT 1
        """)
    Optional<OrderType> findLatestOrderTypeByPatientAndProfile(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query(
            """
    SELECT o.id
    FROM Order o
    WHERE o.patient.id = :patientId
    ORDER BY o.createdAt DESC
    LIMIT 1
    """)
    Optional<String> findLatestOrderIdByPatientId(@Param("patientId") Long patientId);

    @Query(
            nativeQuery = true,
            value =
                    """
            SELECT COUNT(DISTINCT o.patient_id)
            FROM orders o
            LEFT JOIN patient p ON p.id = o.patient_id
            WHERE (
                o.owner_profile_id = :profileId
                OR (o.target_profile_id = :profileId AND o.status != 'DRAFT')
            )
            AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
            """)
    Long countPatientsByProfileId(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT COUNT(DISTINCT o.patient_id)
    FROM orders o
    WHERE o.order_type = 'PLANNING_ORDER'
      AND (o.target_profile_id = :userProfileId OR o.owner_profile_id = :userProfileId)
      AND o.status <> 'DRAFT'
    """,
            nativeQuery = true)
    int findCountByProfileId(@Param("userProfileId") Long userProfileId);

    @Query(
            """
    SELECT DISTINCT o.patient.id
    FROM Order o
    WHERE (o.assignedLabUserId = :assignedLabUserId
           OR o.ownerProfile.id = :assignedLabUserId
           OR o.targetProfile.id = :assignedLabUserId)
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

    @Query(
            """
    SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END
    FROM Order o
    WHERE o.patient.id = :patientId
    AND o.parentOrder IS NOT NULL
""")
    Boolean hasClonedOrder(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT DISTINCT o.id
    FROM Order o
    WHERE o.patient.id = :patientId
        AND o.status = 'ARCHIVED'
    """)
    List<String> findArchivedOrderIdsByPatient(@Param("patientId") Long patientId);

    @Query(
            """
            SELECT DISTINCT o.id
            FROM Order o
            WHERE o.patient.id = :patientId
                AND o.status = 'ARCHIVED'
                AND o.status != 'DRAFT'
            """)
    List<String> findArchivedOrderIdsByPatientExcludingDraft(@Param("patientId") Long patientId);

    @Query(
            """
            SELECT o
            FROM Order o
            LEFT JOIN FETCH o.serviceProduct sp
            LEFT JOIN FETCH sp.productCategory pc
            LEFT JOIN FETCH sp.userProfile up
            LEFT JOIN FETCH up.user u
            LEFT JOIN FETCH up.organization org
            LEFT JOIN FETCH up.doctor do
            LEFT JOIN FETCH up.doctorBilling db
            WHERE o.patient.id = :patientId
                AND o.status != 'ARCHIVED'
                AND o.status != 'DRAFT'
            ORDER BY o.createdAt DESC
            LIMIT 1
            """)
    Optional<Order> findLatestActiveOrderIdByPatientExcludingDraft(@Param("patientId") Long patientId);

    @Query(
            """
            SELECT o
            FROM Order o
            LEFT JOIN FETCH o.serviceProduct sp
            LEFT JOIN FETCH sp.productCategory pc
            LEFT JOIN FETCH sp.userProfile up
            LEFT JOIN FETCH up.user u
            LEFT JOIN FETCH up.organization org
            LEFT JOIN FETCH up.doctor do
            LEFT JOIN FETCH up.doctorBilling db
            WHERE o.patient.id = :patientId
                AND o.status != 'ARCHIVED'
            ORDER BY o.createdAt DESC
            LIMIT 1
            """)
    Optional<Order> findLatestActiveOrderIdByPatientIncludingDraft(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
            SELECT
                COUNT(*) AS totalCount,
                SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) AS draftCount,
                SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) AS orderedCount,
                SUM(CASE WHEN o.status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archivedCount,
                SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS inProgressCount,
                SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) AS inReviewCount,
                SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) AS onHoldCount,
                SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) AS rePlanCount,
                SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) AS approvedCount,
                SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedCount,
                SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) AS needMoreInfoCount,
                SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelledCount,
                SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) AS stlFilesRequestedCount,
                SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) AS stlFilesUploadedCount,
                (
                    SELECT o2.status
                    FROM orders o2
                    WHERE o2.patient_id = :patientId
                    ORDER BY o2.created_at DESC
                    LIMIT 1
                ) AS latestOrderStatus,
                (
                    SELECT o2.id
                    FROM orders o2
                    WHERE o2.patient_id = :patientId
                    ORDER BY o2.created_at DESC
                    LIMIT 1
                ) AS latestOrderId,
                -- Count treatment plans with SENT_FOR_APPROVAL on the latest order of this patient
                (
                    SELECT COUNT(tp.id)
                    FROM treatment_plan tp
                    WHERE tp.linked_order_id = (
                        SELECT o3.id
                        FROM orders o3
                        WHERE o3.patient_id = :patientId
                        ORDER BY o3.created_at DESC
                        LIMIT 1
                    )
                    AND tp.initiator_status = 'SENT_FOR_APPROVAL'
                ) AS inReviewTreatmentCount
            FROM orders o
            WHERE o.patient_id = :patientId
            """,
            nativeQuery = true)
    OrderCountSummary getOrderCountSummaryByPatientAndProfile(@Param("patientId") Long patientId);

    @Query(
            value =
                    """
    WITH latest_non_draft_orders AS (
        SELECT DISTINCT ON (o.patient_id) o.id, o.status, o.created_at, o.patient_id
        FROM orders o
        JOIN patient p ON p.id = o.patient_id
        WHERE o.owner_profile_id = :profileId
          AND o.status != 'DRAFT'
          AND p.patient_status != 'ARCHIVE'
        ORDER BY o.patient_id, o.created_at DESC
    ),
    draft_orders AS (
        SELECT DISTINCT ON (o.patient_id) o.id, o.status, o.created_at, o.patient_id
        FROM orders o
        JOIN patient p ON p.id = o.patient_id
        WHERE o.owner_profile_id = :profileId
        AND o.status = 'DRAFT'
        AND p.patient_status != 'ARCHIVE'
        ORDER BY o.patient_id, o.created_at DESC
    ),
    no_order_patients AS (
        SELECT pdo.patient_id
        FROM patient_doctor_organization pdo
        JOIN patient p ON p.id = pdo.patient_id
        WHERE pdo.user_profile_id = :profileId
          AND NOT EXISTS (
              SELECT 1 FROM orders o WHERE o.patient_id = pdo.patient_id
          )
        AND p.patient_status != 'ARCHIVE'
    ),
    all_orders_for_date AS (
        SELECT o.created_at
        FROM orders o
        JOIN patient p ON p.id = o.patient_id
        WHERE o.owner_profile_id = :profileId
        AND p.patient_status != 'ARCHIVE'
    )
    SELECT
        -- Active cases
        SUM(
          CASE
            WHEN lo.status IN (
              'NEED_MORE_INFO', 'IN_PROGRESS', 'ORDERED', 'IN_REVIEW',
              'RE_PLAN', 'APPROVED', 'STL_FILES_REQUESTED',
              'STL_FILES_UPLOADED', 'SHIPPED', 'DELIVERED'
            )
            THEN 1
            ELSE 0
          END
        ) AS active,

        -- Draft
        (SELECT COUNT(*) FROM draft_orders) + (SELECT COUNT(*) FROM no_order_patients) AS draft,

        -- Need Info
        SUM(CASE WHEN lo.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) AS needInfo,

        -- In Progress
        SUM(
         CASE
           WHEN lo.status IN ('IN_PROGRESS', 'ORDERED')
           THEN 1
           ELSE 0
         END
        ) AS inProgress,

        -- In Review
        SUM(
          CASE
            WHEN lo.status = 'IN_REVIEW'
            THEN 1
            ELSE 0
          END
        ) AS inReview,

        -- In Revision
        SUM(
           CASE
             WHEN lo.status = 'RE_PLAN'
             THEN 1
             ELSE 0
           END
         ) AS inRevision,

        -- Approved with stl file requests
        SUM(
          CASE
            WHEN lo.status IN ('APPROVED', 'STL_FILES_REQUESTED', 'STL_FILES_UPLOADED')
            THEN 1
            ELSE 0
          END
        ) AS approved,

        -- Completed
        SUM(
           CASE
             WHEN lo.status = 'COMPLETED'
             THEN 1
             ELSE 0
           END
         ) AS completed,

        -- Cases this month (latest non-draft per patient)
        SUM(
          CASE
            WHEN EXTRACT(MONTH FROM lo.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)
             AND EXTRACT(YEAR FROM lo.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
            THEN 1
            ELSE 0
          END
        ) AS casesThisMonth,

        -- Cases last month (latest non-draft per patient)
        SUM(
           CASE
             WHEN EXTRACT(MONTH FROM lo.created_at) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')
              AND EXTRACT(YEAR FROM lo.created_at) = EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '1 month')
             THEN 1
             ELSE 0
           END
        ) AS casesLastMonth,

        -- Latest activity date from all orders
        (SELECT MAX(created_at) FROM all_orders_for_date) AS lastActivityDate
    FROM latest_non_draft_orders lo
    """,
            nativeQuery = true)
    PlanningPracticeCounts getPlanningPracticeCounts(@Param("profileId") Long profileId);

    @Query("SELECT o.targetProfile FROM Order o " + "JOIN o.targetProfile tp "
            + "JOIN FETCH tp.user u "
            + "WHERE o.patient.id = :patientId "
            + "AND o.ownerProfile.id = :profileId "
            + "ORDER BY o.createdAt DESC "
            + "LIMIT 1")
    Optional<UserProfile> findLatestTargetProfileByPatientIdAndOwnerProfileId(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query("SELECT o.id FROM Order o " + "WHERE o.patient.id = :patientId "
            + "AND o.ownerProfile.id = :ownerProfileId "
            + "AND o.status != :status "
            + "AND o.id != :excludedOrderId")
    List<String> findNonArchivedOrderIdsByPatientIdExcludingCurrent(
            @Param("patientId") Long patientId,
            @Param("ownerProfileId") Long ownerProfileId,
            @Param("status") OrderStatus status,
            @Param("excludedOrderId") String excludedOrderId);

    @Query(
            value =
                    """
    SELECT
        o.patient_id AS patientId,
        COUNT(*) AS orderCount,
        (SELECT COALESCE(db2.company_brand_name,
                    CONCAT_WS(' ', u2.salutation, u2.first_name, u2.last_name))
         FROM orders o2
         LEFT JOIN user_profile op2 ON o2.owner_profile_id = op2.id
         LEFT JOIN doctor_billing db2 ON op2.doctor_billing_id = db2.id
         LEFT JOIN users u2 ON op2.user_id = u2.id
         WHERE o2.patient_id = o.patient_id AND o2.owner_profile_id = :profileId
         ORDER BY o2.created_at DESC LIMIT 1
        ) AS customerName
    FROM orders o
    WHERE o.patient_id IN (:patientIds)
      AND o.owner_profile_id = :profileId
    GROUP BY o.patient_id
    """,
            nativeQuery = true)
    List<PatientOrderSummaryResult> batchSentOrderSummary(
            @Param("patientIds") Set<Long> patientIds, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT
        o.patient_id AS patientId,
        COUNT(*) AS orderCount,
        (SELECT COALESCE(db2.company_brand_name,
                    CONCAT_WS(' ', u2.salutation, u2.first_name, u2.last_name))
         FROM orders o2
         LEFT JOIN user_profile op2 ON o2.owner_profile_id = op2.id
         LEFT JOIN doctor_billing db2 ON op2.doctor_billing_id = db2.id
         LEFT JOIN users u2 ON op2.user_id = u2.id
         WHERE o2.patient_id = o.patient_id AND o2.target_profile_id = :profileId
         ORDER BY o2.created_at DESC LIMIT 1
        ) AS customerName
    FROM orders o
    WHERE o.patient_id IN (:patientIds)
      AND o.target_profile_id = :profileId
      AND o.status != 'DRAFT'
    GROUP BY o.patient_id
    """,
            nativeQuery = true)
    List<PatientOrderSummaryResult> batchReceivedOrderSummary(
            @Param("patientIds") Set<Long> patientIds, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT
        o.patient_id AS patientId,
        COUNT(*) AS orderCount,
        (SELECT COALESCE(db2.company_brand_name,
                    CONCAT_WS(' ', u2.salutation, u2.first_name, u2.last_name))
         FROM orders o2
         LEFT JOIN user_profile op2 ON o2.owner_profile_id = op2.id
         LEFT JOIN doctor_billing db2 ON op2.doctor_billing_id = db2.id
         LEFT JOIN users u2 ON op2.user_id = u2.id
         WHERE o2.patient_id = o.patient_id AND o2.assigned_lab_user_id = :profileId
         ORDER BY o2.created_at DESC LIMIT 1
        ) AS customerName
    FROM orders o
    WHERE o.patient_id IN (:patientIds)
      AND o.assigned_lab_user_id = :profileId
    GROUP BY o.patient_id
    """,
            nativeQuery = true)
    List<PatientOrderSummaryResult> batchLabStaffOrderSummary(
            @Param("patientIds") Set<Long> patientIds, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT
        sub.patient_id AS patientId,
        sub.order_count AS orderCount,
        sub.customer_name AS customerName
    FROM (
        SELECT
            combined.patient_id,
            SUM(combined.cnt) AS order_count,
            (SELECT COALESCE(db2.company_brand_name,
                        CONCAT_WS(' ', u2.salutation, u2.first_name, u2.last_name))
             FROM orders o2
             LEFT JOIN user_profile op2 ON o2.owner_profile_id = op2.id
             LEFT JOIN doctor_billing db2 ON op2.doctor_billing_id = db2.id
             LEFT JOIN users u2 ON op2.user_id = u2.id
             WHERE o2.patient_id = combined.patient_id AND o2.owner_profile_id = :profileId
             ORDER BY o2.created_at DESC LIMIT 1
            ) AS customer_name
        FROM (
            SELECT o.patient_id, COUNT(*) AS cnt
            FROM orders o
            WHERE o.patient_id IN (:patientIds) AND o.owner_profile_id = :profileId
            GROUP BY o.patient_id
            UNION ALL
            SELECT o.patient_id, COUNT(*) AS cnt
            FROM orders o
            WHERE o.patient_id IN (:patientIds) AND o.target_profile_id = :profileId AND o.status != 'DRAFT'
            GROUP BY o.patient_id
        ) combined
        GROUP BY combined.patient_id
    ) sub
    """,
            nativeQuery = true)
    List<PatientOrderSummaryResult> batchSentPlusReceivedOrderSummary(
            @Param("patientIds") Set<Long> patientIds, @Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT *
    FROM orders o
    WHERE o.patient_id = :patientId
    ORDER BY o.created_at DESC
    LIMIT 1
    """,
            nativeQuery = true)
    Optional<Order> findLatestOrderByPatient(Long patientId);

    @Query("SELECT o.id FROM Order o WHERE o.patient.id = :patientId AND o.status != 'DRAFT' ORDER BY o.createdAt ASC")
    List<String> findAllOrderIds(@Param("patientId") Long patientId);
}
