package com.dentalstack.patient.feature.order.repository;

import com.dentalstack.patient.feature.order.entity.ManufacturingBatch;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchCountsProjection;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchSummary;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ManufacturingRepository extends JpaRepository<ManufacturingBatch, Long> {

    @Query(
            """
            SELECT DISTINCT mb FROM ManufacturingBatch mb
            LEFT JOIN FETCH mb.files
            LEFT JOIN FETCH mb.treatmentPlan tp
            LEFT JOIN FETCH mb.patientTaskTracker ptt
            LEFT JOIN FETCH ptt.createdByProfile cb
            LEFT JOIN FETCH cb.user ucb
            LEFT JOIN FETCH ptt.assignee ass
            LEFT JOIN FETCH ass.user ua
            LEFT JOIN FETCH mb.order o
            LEFT JOIN FETCH mb.patient p
            LEFT JOIN FETCH mb.serviceProduct sp
            LEFT JOIN FETCH sp.productCategory pc
            WHERE mb.treatmentPlan.id = :treatmentPlanId
            """)
    List<ManufacturingBatch> findByTreatmentPlanId(@Param("treatmentPlanId") Long treatmentPlanId);

    @Query(
            """
            SELECT DISTINCT mb FROM ManufacturingBatch mb
            LEFT JOIN FETCH mb.files
            LEFT JOIN FETCH mb.treatmentPlan tp
            LEFT JOIN FETCH mb.patientTaskTracker ptt
            LEFT JOIN FETCH ptt.createdByProfile cb
            LEFT JOIN FETCH mb.manufacturingOwnerProfile mob
            LEFT JOIN FETCH mob.user mobus
            LEFT JOIN FETCH cb.user ucb
            LEFT JOIN FETCH ptt.assignee ass
            LEFT JOIN FETCH ass.user ua
            LEFT JOIN FETCH mb.order o
            LEFT JOIN FETCH mb.patient p
            LEFT JOIN FETCH mb.serviceProduct sp
            LEFT JOIN FETCH sp.productCategory pc
            LEFT JOIN FETCH p.doctorOrganization pdo
            LEFT JOIN FETCH mb.outsourcedTo ot
            LEFT JOIN FETCH ot.doctorBilling dob
            LEFT JOIN FETCH ot.user otu
            WHERE mb.treatmentPlan.id = :treatmentPlanId
            AND (
                pdo.userProfile.id = :userProfileId
                OR pdo.addedByUserProfile.id = :userProfileId
                OR (
                    pdo.userProfile.id != :userProfileId
                    AND pdo.addedByUserProfile.id != :userProfileId
                    AND mb.outsourcedTo.id = :userProfileId
                )
            )
            """)
    List<ManufacturingBatch> findByTreatmentPlanIdAndUserProfileId(
            @Param("treatmentPlanId") Long treatmentPlanId, @Param("userProfileId") Long userProfileId);

    @Query(
            """
    SELECT DISTINCT mb FROM ManufacturingBatch mb
    LEFT JOIN FETCH mb.files
    LEFT JOIN FETCH mb.treatmentPlan tp
    LEFT JOIN FETCH mb.patientTaskTracker ptt
    LEFT JOIN FETCH ptt.createdByProfile cb
    LEFT JOIN FETCH ptt.assignee ass
    LEFT JOIN FETCH mb.order o
    LEFT JOIN FETCH mb.patient p
    LEFT JOIN FETCH mb.serviceProduct sp
    LEFT JOIN FETCH sp.productCategory pc
    WHERE mb.order.id = :orderId
    """)
    List<ManufacturingBatch> findByOrderId(@Param("orderId") String orderId);

    @Query("SELECT COUNT(mb) FROM ManufacturingBatch mb WHERE mb.treatmentPlan.id = :treatmentPlanId")
    int countByTreatmentPlanId(@Param("treatmentPlanId") Long treatmentPlanId);

    @Query(
            "SELECT mb FROM ManufacturingBatch mb WHERE mb.treatmentPlan.id = :treatmentPlanId ORDER BY mb.createdAt DESC")
    List<ManufacturingBatch> findAllByTreatmentPlanId(@Param("treatmentPlanId") Long treatmentPlanId);

    @Query(
            """
    SELECT DISTINCT mb FROM ManufacturingBatch mb
    LEFT JOIN FETCH mb.files
    LEFT JOIN FETCH mb.treatmentPlan tp
    LEFT JOIN FETCH mb.patientTaskTracker ptt
    LEFT JOIN FETCH ptt.createdByProfile cb
    LEFT JOIN FETCH ptt.assignee ass
    LEFT JOIN FETCH mb.order o
    LEFT JOIN FETCH mb.patient p
    LEFT JOIN FETCH mb.serviceProduct sp
    LEFT JOIN FETCH sp.productCategory pc
    WHERE mb.patient.id = :patientId
    """)
    List<ManufacturingBatch> findByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT mb FROM ManufacturingBatch mb
    LEFT JOIN FETCH mb.files
    LEFT JOIN FETCH mb.treatmentPlan tp
    WHERE mb.id = :id
""")
    Optional<ManufacturingBatch> getManufacturingById(@Param("id") Long id);

    @Query(
            """
            SELECT mb FROM ManufacturingBatch mb
            LEFT JOIN FETCH mb.files
            LEFT JOIN FETCH mb.treatmentPlan tp
            LEFT JOIN FETCH mb.serviceProduct sp
            LEFT JOIN FETCH sp.userProfile
            LEFT JOIN FETCH sp.productCategory
            WHERE mb.id = :id
            """)
    Optional<ManufacturingBatch> getManufacturingByIdWithServiceProduct(@Param("id") Long id);

    @Query(
            """
    SELECT mb FROM ManufacturingBatch mb
    LEFT JOIN FETCH mb.files
    LEFT JOIN FETCH mb.manufacturingOwnerProfile ownerProfile
    LEFT JOIN FETCH ownerProfile.user ownerUser
    LEFT JOIN FETCH mb.manufacturingTargetProfile targetProfile
    LEFT JOIN FETCH targetProfile.user targetUser
    LEFT JOIN FETCH mb.patient patient
    WHERE mb.id = :id
""")
    Optional<ManufacturingBatch> getManufacturingWithOwnerAndTargetProfile(@Param("id") Long id);

    @Query(
            """
        SELECT
            mb.id as id,
            mb.order.id as orderId,
            mb.treatmentPlan.id as treatmentPlanId,
            mb.patient.id as patientId,
            mb.batchType as batchType,
            mb.status as status,
            mb.upperAlignerStart as upperAlignerStart,
            mb.upperAlignerEnd as upperAlignerEnd,
            mb.lowerAlignerStart as lowerAlignerStart,
            mb.lowerAlignerEnd as lowerAlignerEnd,
            mb.totalAligners as totalAligners,
            mb.startDate as startDate,
            mb.completionDate as completionDate,
            mb.shippingDate as shippingDate,
            mb.deliveryDate as deliveryDate,
            mb.isCurrent as isCurrent
        FROM ManufacturingBatch mb
        WHERE mb.treatmentPlan.id = :treatmentPlanId
        ORDER BY mb.startDate DESC
        """)
    List<ManufacturingBatchSummary> findSummariesByTreatmentPlanId(@Param("treatmentPlanId") Long treatmentPlanId);

    @Query(
            """
            SELECT
                mb.id as id,
                mb.order.id as orderId,
                mb.treatmentPlan.id as treatmentPlanId,
                mb.patient.id as patientId,
                mb.batchType as batchType,
                mb.status as status,
                mb.upperAlignerStart as upperAlignerStart,
                mb.upperAlignerEnd as upperAlignerEnd,
                mb.lowerAlignerStart as lowerAlignerStart,
                mb.lowerAlignerEnd as lowerAlignerEnd,
                mb.totalAligners as totalAligners,
                mb.startDate as startDate,
                mb.completionDate as completionDate,
                mb.shippingDate as shippingDate,
                mb.deliveryDate as deliveryDate,
                mb.isCurrent as isCurrent
            FROM ManufacturingBatch mb
            WHERE mb.treatmentPlan.id IN :treatmentPlanIds
            ORDER BY mb.treatmentPlan.id, mb.startDate DESC
            """)
    List<ManufacturingBatchSummary> findSummariesByTreatmentPlanIds(
            @Param("treatmentPlanIds") List<Long> treatmentPlanIds);

    @Query(
            """
    SELECT
        SUM(CASE WHEN mb.status = 'PENDING' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN mb.status = 'MANUFACTURING_PENDING' THEN 1 ELSE 0 END) as manufacturingPendingCount,
        SUM(CASE WHEN mb.status = 'MANUFACTURING_STARTED' THEN 1 ELSE 0 END) as manufacturingStartedCount,
        SUM(CASE WHEN mb.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressCount,
        SUM(CASE WHEN mb.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount,
        SUM(CASE WHEN mb.status = 'SHIPPED' THEN 1 ELSE 0 END) as shippedCount,
        SUM(CASE WHEN mb.status = 'DELIVERED' THEN 1 ELSE 0 END) as deliveredCount,
        SUM(CASE WHEN mb.status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount,
        COUNT(mb.id) as totalCount
    FROM ManufacturingBatch mb
    WHERE mb.manufacturingTargetProfile.id = :targetProfileId
     OR mb.manufacturingOwnerProfile.id = :targetProfileId

    """)
    ManufacturingBatchCountsProjection countManufacturingBatchesByTargetProfile(
            @Param("targetProfileId") long targetProfileId);

    @Query(
            """
    SELECT DISTINCT p.id
    FROM Patient p
    WHERE p.id IN (
        SELECT tp.patient.id
        FROM TreatmentPlan tp
        WHERE tp.outsourcedTo.id = :profileId
        AND tp.patient.patientStatus != 'ARCHIVE'

        UNION

        SELECT mb.patient.id
        FROM ManufacturingBatch mb
        WHERE mb.outsourcedTo.id = :profileId
        AND mb.patient.patientStatus != 'ARCHIVE'
    )
    AND (
        :search IS NULL OR :search = '' OR
        LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :search, '%')) OR
        LOWER(CONCAT(p.firstName, ' ', p.lastName)) LIKE LOWER(CONCAT('%', :search, '%'))
    )
""")
    List<Long> findPatientIdsByOutsourcedProfile(@Param("profileId") Long profileId, @Param("search") String search);

    @Modifying
    @Query("""
    delete from ManufacturingBatch mb
    where mb.patientTaskTracker.id in :taskIds
""")
    void deleteByPatientTaskTrackerIdIn(@Param("taskIds") List<Long> taskIds);

    @Modifying
    @Transactional
    @Query(
            """
    update ManufacturingBatch mb
    set mb.isArchived = true,
        mb.isActive = false
    where mb.patient.id = :patientId
""")
    void markManufacturingArchive(@Param("patientId") Long patientId);
}
