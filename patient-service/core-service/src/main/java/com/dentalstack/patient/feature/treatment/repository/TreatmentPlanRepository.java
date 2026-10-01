package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.order.enums.ManufacturingStatus;
import com.dentalstack.patient.feature.order.enums.OrderTreatmentPlanStatus;
import com.dentalstack.patient.feature.order.projection.ManufacturingBatchProjection;
import com.dentalstack.patient.feature.order.projection.TreatmentPlanDetailsProjection;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanProfileSummary;
import com.dentalstack.patient.feature.treatment.projection.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.projection.TreatmentStageDTOSummery;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Long> {

    @Query("SELECT a FROM TreatmentPlan a WHERE a.patient.id = ?1 and a.treatmentSubType = ?2")
    List<TreatmentPlan> findByPatientAndTreatmentSubType(Long patientId, ProductTypeName treatmentSubType);

    @Query(
            """
    SELECT DISTINCT tp
    FROM TreatmentPlan tp
    LEFT JOIN FETCH tp.shippingDetails sd
    LEFT JOIN FETCH tp.manufacturingBatches mb
    WHERE tp.patient.id = :patientId
      AND tp.treatmentSubType = :treatmentSubType
      AND tp.approverStatus = :status
    ORDER BY tp.updatedAt DESC
    """)
    List<TreatmentPlan> findByPatientIdAndTreatmentSubType(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("status") OrderTreatmentPlanStatus status);

    @Query(
            """
        SELECT DISTINCT tp
        FROM TreatmentPlan tp
        LEFT JOIN FETCH tp.shippingDetails sd
        LEFT JOIN FETCH tp.manufacturingBatches mb
        WHERE tp.patient.id = :patientId
          AND tp.treatmentSubType = :treatmentSubType
          AND tp.approverStatus = :status
          AND (:orderId IS NULL OR tp.orderId = :orderId)
        ORDER BY tp.updatedAt DESC
        """)
    List<TreatmentPlan> findByPatientIdAndTreatmentSubTypeWithOrder(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("status") OrderTreatmentPlanStatus status,
            @Param("orderId") String orderId);

    @Query(
            """
    SELECT DISTINCT t FROM TreatmentPlan t
    JOIN FETCH t.tracking
    LEFT JOIN FETCH t.shippingDetails tsd
    LEFT JOIN FETCH t.order o
    LEFT JOIN FETCH o.shippingDetails sd
    WHERE t.patient.id = :patientId
    AND t.treatmentSubType = :treatmentSubType
""")
    List<TreatmentPlan> findByPatientAndDoctorIdAndTreatmentSubTypeWithTracking(
            @Param("patientId") Long patientId, @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query(
            "SELECT t FROM TreatmentPlan t JOIN FETCH t.tracking WHERE t.doctorId = :doctorId AND t.treatmentSubType IN :treatmentSubTypes")
    List<TreatmentPlan> findByDoctorIdAndTreatmentSubTypesWithTracking(
            @Param("doctorId") Long doctorId, @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes);

    @Query("SELECT t.patient.id AS patientId, t.status AS status, t.tracking.status AS trackingStatus "
            + "FROM TreatmentPlan t JOIN t.tracking "
            + "WHERE t.doctorId = :doctorId AND t.treatmentSubType IN :treatmentSubTypes")
    List<TreatmentPlanSummary> findTreatmentPlanSummariesByDoctorIdAndTreatmentSubTypes(
            @Param("doctorId") Long doctorId, @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes);

    List<TreatmentPlan> findByPatientIdAndStatusIn(Long patientId, List<AlignerTreatmentStatus> alignerTreatmentStatus);

    Optional<TreatmentPlan> findByPatientIdAndStatus(Long patientId, AlignerTreatmentStatus alignerTreatmentStatus);

    @Query("SELECT tp FROM TreatmentPlan tp JOIN FETCH tp.tracking WHERE tp.id = :treatmentPlanId")
    Optional<TreatmentPlan> findByIdWithTracking(@Param("treatmentPlanId") Long treatmentPlanId);

    Integer countByPatientId(Long patientId);

    @Query("SELECT t FROM TreatmentPlan t JOIN FETCH t.tracking " + "WHERE t.patient.id = :patientId "
            + "AND t.treatmentSubType = :treatmentSubType "
            + "AND t.status = 'ACTIVE'")
    Optional<TreatmentPlan> findActiveTreatmentPlanByPatientIdAndTreatmentSubTypeWithTracking(
            @Param("patientId") Long patientId, @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query("SELECT t.id FROM TreatmentPlan t WHERE t.patient.id = :patientId AND t.status = 'ACTIVE'")
    Optional<Long> findActiveTreatmentPlanIdByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT t FROM TreatmentPlan t
    LEFT JOIN FETCH t.manufacturingBatches mb
    LEFT JOIN FETCH t.order o
    LEFT JOIN FETCH o.shippingDetails sd
    LEFT JOIN PatientDoctorOrganization pdo ON pdo.patient.id = t.patient.id
    WHERE t.patient.id = :patientId
      AND t.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
      AND (o.ownerProfile.id IS NULL OR o.ownerProfile.id = pdo.userProfile.id)
    ORDER BY
      CASE
        WHEN t.status = 'ACTIVE' THEN 1
        WHEN t.status = 'PAUSED' THEN 2
        WHEN t.status = 'DEACTIVATED' THEN 3
        ELSE 4
      END,
      t.createdAt DESC
    """)
    List<TreatmentPlan> findPrioritizedPlans(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT tp FROM TreatmentPlan tp
    LEFT JOIN FETCH tp.order o
    LEFT JOIN FETCH tp.manufacturingBatches
    WHERE tp.id = :id
    """)
    Optional<TreatmentPlan> findByIdWithOrderAndBatches(@Param("id") Long id);

    @Query(
            """
    SELECT tp
    FROM TreatmentPlan tp
    LEFT JOIN tp.order o
    LEFT JOIN PatientDoctorOrganization pdo ON pdo.patient.id = tp.patient.id
    WHERE tp.patient.id = :patientId
      AND (
          o.ownerProfile.id IS NULL OR
          o.ownerProfile.id = pdo.userProfile.id OR
          o.targetProfile.id = pdo.addedByUserProfile.id OR
          o.ownerProfile.id = pdo.addedByUserProfile.id
      )
""")
    List<TreatmentPlan> findTreatmentPlansByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT tp
    FROM TreatmentPlan tp
    LEFT JOIN tp.order o
    LEFT JOIN PatientDoctorOrganization pdo ON pdo.patient.id = tp.patient.id
    WHERE tp.patient.id = :patientId
""")
    List<TreatmentPlan> findTreatmentPlansByPatients(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT tp
    FROM TreatmentPlan tp
    LEFT JOIN tp.order o
    LEFT JOIN PatientDoctorOrganization pdo ON pdo.patient.id = tp.patient.id
    WHERE tp.patient.id = :patientId
      AND (
          o.ownerProfile.id IS NULL OR
          (:profileId IS NOT NULL AND (
              o.ownerProfile.id = :profileId OR
              o.targetProfile.id = :profileId
          )) OR
          (:profileId IS NULL AND (
              o.ownerProfile.id = pdo.userProfile.id OR
              o.targetProfile.id = pdo.addedByUserProfile.id OR
              o.ownerProfile.id = pdo.addedByUserProfile.id
          ))
      )
    """)
    List<TreatmentPlan> findTreatmentPlansByPatientIdWithProfileId(
            @Param("patientId") Long patientId, @Param("profileId") Long profileId);

    @Query("SELECT DISTINCT tp.patient.id FROM TreatmentPlan tp " + "WHERE tp.doctorId = :doctorId "
            + "AND tp.patient.id IN :patientIds "
            + "AND tp.status = :status")
    List<Long> findPatientIdsWithTreatmentPlansByStatus(
            @Param("doctorId") Long doctorId,
            @Param("patientIds") List<Long> patientIds,
            @Param("status") AlignerTreatmentStatus status);

    List<TreatmentPlan> findByPatientId(Long patientId);

    @Query(
            value =
                    """
    SELECT
        tp.id as id,
        tp.status as status,
        tp.deactivatedAt as deactivatedAt,
        tp.alignerDetailsMetadata as alignerDetailsMetadata,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'upperJawDetails'), 'startsWith') as upperStart,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'upperJawDetails'), 'endsWith') as upperEnd,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'lowerJawDetails'), 'startsWith') as lowerStart,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'lowerJawDetails'), 'endsWith') as lowerEnd,
        p.id as patientId,
        CONCAT(p.firstName, ' ', p.lastName) as patientFullName,
        p.profilePictureUrl as patientProfileUrl,
        o.dueBy as dueBy,
        o.id as orderId,
        CASE
            WHEN db.companyBrandName IS NOT NULL AND db.companyBrandName != ''
            THEN db.companyBrandName
            ELSE TRIM(CONCAT(
                CASE WHEN u.salutation IS NOT NULL AND u.salutation != '' THEN CONCAT(u.salutation, '. ') ELSE '' END,
                CASE WHEN u.firstName IS NOT NULL AND u.firstName != '' THEN CONCAT(u.firstName, ' ') ELSE '' END,
                CASE WHEN u.lastName IS NOT NULL AND u.lastName != '' THEN u.lastName ELSE '' END
            ))
        END as customerName
    FROM TreatmentPlan tp
    LEFT JOIN tp.order o
    LEFT JOIN tp.patient p
    LEFT JOIN p.doctorOrganization do
    LEFT JOIN do.userProfile up
    LEFT JOIN up.user u
    LEFT JOIN up.doctorBilling db
    WHERE tp.id IN :treatmentPlanIds
    """)
    List<TreatmentPlanSummary> findTreatmentPlanSummariesByIds(@Param("treatmentPlanIds") List<Long> treatmentPlanIds);

    @Query(
            """
        SELECT
            tp.id as id,
            tp.status as status,
            tp.deactivatedAt as deactivatedAt,
            tp.alignerDetailsMetadata as alignerDetailsMetadata,
            function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'upperJawDetails'), 'startsWith') as upperStart,
            function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'upperJawDetails'), 'endsWith') as upperEnd,
            function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'lowerJawDetails'), 'startsWith') as lowerStart,
            function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'lowerJawDetails'), 'endsWith') as lowerEnd,
            p.id as patientId,
            CONCAT(p.firstName, ' ', p.lastName) as patientFullName,
            p.profilePictureUrl as patientProfileUrl,
            o.dueBy as dueBy,
            o.id as orderId,
            CASE
                WHEN db.companyBrandName IS NOT NULL AND db.companyBrandName != ''
                THEN db.companyBrandName
                ELSE TRIM(CONCAT(
                    CASE WHEN u.salutation IS NOT NULL AND u.salutation != '' THEN CONCAT(u.salutation, '. ') ELSE '' END,
                    CASE WHEN u.firstName IS NOT NULL AND u.firstName != '' THEN CONCAT(u.firstName, ' ') ELSE '' END,
                    CASE WHEN u.lastName IS NOT NULL AND u.lastName != '' THEN u.lastName ELSE '' END
                ))
            END as customerName
        FROM TreatmentPlan tp
        LEFT JOIN tp.order o
        LEFT JOIN tp.patient p
        LEFT JOIN p.doctorOrganization do
        LEFT JOIN do.userProfile up
        LEFT JOIN up.user u
        LEFT JOIN up.doctorBilling db
        WHERE tp.status != :completedStatus
        AND (o.dueBy IS NULL OR o.dueBy BETWEEN :startDate AND :endDate)
        """)
    List<TreatmentPlanSummary> findActiveTreatmentPlansWithDueByInRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("completedStatus") AlignerTreatmentStatus completedStatus);

    @Query(
            value =
                    """
    SELECT
        tp.id as id,
        tp.status as status,
        tp.deactivatedAt as deactivatedAt,
        tp.alignerDetailsMetadata as alignerDetailsMetadata,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'upperJawDetails'), 'startsWith') as upperStart,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'upperJawDetails'), 'endsWith') as upperEnd,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'lowerJawDetails'), 'startsWith') as lowerStart,
        function('jsonb_extract_path_text', function('jsonb_extract_path', tp.alignerDetailsMetadata, 'lowerJawDetails'), 'endsWith') as lowerEnd,
        p.id as patientId,
        CONCAT(p.firstName, ' ', p.lastName) as patientFullName,
        p.profilePictureUrl as patientProfileUrl,
        o.dueBy as dueBy,
        o.id as orderId,
        CASE
            WHEN db.companyBrandName IS NOT NULL AND db.companyBrandName != ''
            THEN db.companyBrandName
            ELSE TRIM(CONCAT(
                CASE WHEN u.salutation IS NOT NULL AND u.salutation != '' THEN CONCAT(u.salutation, '. ') ELSE '' END,
                CASE WHEN u.firstName IS NOT NULL AND u.firstName != '' THEN CONCAT(u.firstName, ' ') ELSE '' END,
                CASE WHEN u.lastName IS NOT NULL AND u.lastName != '' THEN u.lastName ELSE '' END
            ))
        END as customerName
    FROM TreatmentPlan tp
    LEFT JOIN tp.order o
    LEFT JOIN tp.patient p
    LEFT JOIN p.doctorOrganization do
    LEFT JOIN do.userProfile up
    LEFT JOIN up.user u
    LEFT JOIN up.doctorBilling db
    WHERE tp.id = :treatmentPlanId
    """)
    TreatmentPlanSummary findTreatmentPlanSummaryById(@Param("treatmentPlanId") Long treatmentPlanId);

    @Query(
            value =
                    """
    SELECT CASE
        WHEN EXISTS (
            SELECT 1
            FROM treatment_plan tp_active
            WHERE tp_active.patient_id = :patientId
              AND tp_active.status = 'ACTIVE'
        )
        AND EXISTS (
            SELECT 1
            FROM treatment_plan tp_deactivated
            WHERE tp_deactivated.patient_id = :patientId
              AND tp_deactivated.status = 'DEACTIVATED'
        )
        THEN 'REFINEMENT'

        WHEN EXISTS (
            SELECT 1
            FROM treatment_plan tp_only_deactivated
            WHERE tp_only_deactivated.patient_id = :patientId
              AND tp_only_deactivated.status = 'DEACTIVATED'
        )
        AND NOT EXISTS (
            SELECT 1
            FROM treatment_plan tp_other
            WHERE tp_other.patient_id = :patientId
              AND tp_other.status IN ('ACTIVE', 'PAUSED')
        )
        THEN 'ARCHIVED'

        ELSE 'NEW'
    END
    """,
            nativeQuery = true)
    String determineCaseTypeForPatient(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT tp FROM TreatmentPlan tp
    WHERE tp.createdAt = (
        SELECT MAX(tp2.createdAt)
        FROM TreatmentPlan tp2
        WHERE tp2.patient = tp.patient
    )
    ORDER BY tp.createdAt DESC
    """)
    List<TreatmentPlan> findLatestTreatmentPlanForAllPatients();

    List<TreatmentPlan> findByDoctorId(long doctorId);

    @Query("SELECT t FROM TreatmentPlan t " + "LEFT JOIN FETCH t.tracking "
            + "LEFT JOIN FETCH t.manufacturingBatches "
            + "WHERE t.patient.id = :patientId "
            + "AND t.status IN ('ACTIVE', 'COMPLETE') "
            + "ORDER BY CASE WHEN t.tracking IS NOT NULL THEN 0 ELSE 1 END")
    Optional<TreatmentPlan> findActiveTreatmentPlanByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT
        tp.status as status,
        tp.createdAt as createdAt,
        tp.treatmentPlanningLink as treatmentPlanningLink,
        tp.isApprovedByPatient as isApprovedByPatient,
        tp.approvedByPatientAt as approvedByPatientAt
    FROM TreatmentPlan tp
    WHERE tp.patient.id = :patientId
    AND tp.status IN ('ACTIVE', 'DRAFT')
    ORDER BY
        CASE
            WHEN tp.status = 'ACTIVE' THEN 0
            WHEN tp.status = 'DRAFT' THEN 1
        END,
        tp.createdAt DESC
    LIMIT 1
""")
    Optional<TreatmentPlanSummary> findLatestTreatmentPlanSummary(@Param("patientId") Long patientId);

    @Query("SELECT "
            + "tp.id as id, "
            + "tp.treatmentPlanName as treatmentPlanName, "
            + "tp.status as status, "
            + "tp.alignerDetailsMetadata as alignerDetailsMetadata, "
            + "tp.treatmentType as treatmentType, "
            + "tp.treatmentPlanningLink as treatmentPlanningLink, "
            + "tp.treatmentPlanTagName as treatmentPlanTagName, "
            + "tp.isApprovedByPatient as isApprovedByPatient, "
            + "tp.approvedByPatientAt as approvedByPatientAt, "
            + "tp.orderStatusChangedAt as orderStatusChangedAt, "
            + "tp.initiatorStatus as initiatorStatus, "
            + "tp.approverStatus as approverStatus, "
            + "tp.createdAt as createdAt, "
            + "tp.treatmentPlanMetadata as treatmentPlanMetadata, "
            + "tp.stlFileMetadata as stlFileMetadata, "
            + "tp.patient.id as patientId, "
            + "tp.doctorId as doctorId, "
            + "ltp.id as linkedTreatmentPlanId, "
            + "ltp.initiatorStatus as linkedInitiatorStatus, "
            + "ltp.approverStatus as linkedApproverStatus, "
            + "tp.order.id as orderId "
            + "FROM TreatmentPlan tp "
            + "LEFT JOIN tp.linkedTreatmentPlan ltp "
            + "LEFT JOIN tp.order o "
            + "WHERE tp.patient.id = :patientId "
            + "AND tp.treatmentSubType = :treatmentSubType "
            + "ORDER BY tp.updatedAt DESC")
    List<TreatmentPlanSummary> findAlignerTreatmentSummaries(
            @Param("patientId") Long patientId, @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query(
            """
            SELECT
                tp.id as id,
                tp.treatmentPlanName as treatmentPlanName,
                tp.status as status,
                tp.treatmentPlanCompletedRemarks as treatmentPlanCompletedRemarks,
                tp.alignerDetailsMetadata as alignerDetailsMetadata,
                tp.treatmentType as treatmentType,
                tp.treatmentPlanningLink as treatmentPlanningLink,
                tp.treatmentPlanTagName as treatmentPlanTagName,
                tp.isApprovedByPatient as isApprovedByPatient,
                tp.approvedByPatientAt as approvedByPatientAt,
                tp.orderStatusChangedAt as orderStatusChangedAt,
                tp.initiatorStatus as initiatorStatus,
                tp.approverStatus as approverStatus,
                tp.createdAt as createdAt,
                tp.treatmentPlanMetadata as treatmentPlanMetadata,
                tp.stlFileMetadata as stlFileMetadata,
                tp.patient.id as patientId,
                tp.doctorId as doctorId,
                ltp.id as linkedTreatmentPlanId,
                ltp.initiatorStatus as linkedInitiatorStatus,
                ltp.approverStatus as linkedApproverStatus,
                (SELECT COUNT(ltp2.id) FROM TreatmentPlan ltp2 WHERE ltp2.linkedTreatmentPlan = tp) as linkedTreatmentPlanCount,
                ptp.id as parentLinkedTreatmentPlanId,
                ptp.initiatorStatus as parentLinkedInitiatorStatus,
                ptp.approverStatus as parentLinkedApproverStatus,
                o.id as orderId
            FROM TreatmentPlan tp
            LEFT JOIN tp.order o
            LEFT JOIN tp.linkedTreatmentPlan ltp
            LEFT JOIN TreatmentPlan ptp ON ptp.linkedTreatmentPlan = tp
            WHERE tp.patient.id = :patientId
            AND tp.treatmentSubType = :treatmentSubType
            AND o.id = :orderId
            ORDER BY tp.updatedAt DESC
            """)
    List<TreatmentPlanSummary> findTreatmentPlanByOrderIdAndPatient(
            @Param("patientId") Long patientId,
            @Param("orderId") String orderId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query(
            """
    SELECT DISTINCT tp.patient.id
    FROM TreatmentPlan tp
    WHERE tp.brandName IN :brandNames
    AND tp.patient.id IN (:patientIds)
    AND tp.status IN ('ACTIVE', 'PAUSED')
""")
    List<Long> findPatientIdsByBrandNamesAndPatientIds(
            @Param("brandNames") List<String> brandNames, @Param("patientIds") List<Long> patientIds);

    @Query(
            """
SELECT COALESCE(
    (SELECT tp.brandName
     FROM TreatmentPlan tp
     WHERE tp.patient.id = :patientId
     AND tp.status = 'ACTIVE'
     ORDER BY tp.createdAt DESC
     LIMIT 1),
    (SELECT tp.brandName
     FROM TreatmentPlan tp
     WHERE tp.patient.id = :patientId
     AND tp.status = 'PAUSED'
     ORDER BY tp.createdAt DESC
     LIMIT 1)
)
""")
    Optional<String> findLatestAlignerJourneyBrandNameByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT DISTINCT p.id
    FROM Patient p
    LEFT JOIN TreatmentPlan tp ON p.id = tp.patient.id AND tp.status IN ('ACTIVE', 'PAUSED')
    WHERE p.id IN :patientIds
    AND tp.id IS NULL
""")
    List<Long> findPatientIdsWithNoActiveTreatmentPlansWithPatientId(@Param("patientIds") List<Long> patientIds);

    @Query(
            """
    SELECT
        tp.id as id,
        tp.status as status,
        tp.deactivatedAt as deactivatedAt,
        tp.reasonForDeactivation as treatmentDeactivatedReason,
        tp.otherRemarks as treatmentDeactivatedRemark
    FROM TreatmentPlan tp
    WHERE tp.patient.id = :patientId
    AND tp.treatmentSubType = :treatmentSubType
    AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
    AND tp.id = (
        SELECT t.id
        FROM TreatmentPlan t
        WHERE t.patient.id = :patientId
        AND t.treatmentSubType = :treatmentSubType
        AND t.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
        ORDER BY t.id DESC
        LIMIT 1
    )
""")
    Optional<TreatmentPlanSummary> findLatestNonDraftTreatmentPlan(
            @Param("patientId") Long patientId, @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query(
            """
            SELECT
                p.id AS patientId,
                CASE
                    WHEN EXISTS (
                        SELECT 1 FROM TreatmentPlan tp2
                        WHERE tp2.patient.id = p.id
                        AND tp2.status = 'DEACTIVATED'
                        AND tp2.id = (
                            SELECT MAX(tp3.id)
                            FROM TreatmentPlan tp3
                            WHERE tp3.patient.id = p.id
                        )
                    ) THEN 'REFINEMENT'
                    WHEN EXISTS (
                        SELECT 1 FROM TreatmentPlan tp2
                        WHERE tp2.patient.id = p.id
                        AND tp2.status = 'ACTIVE'
                        AND (SELECT COALESCE(MAX(aj.doctorTreatmentStartDate), bj.createdAt) FROM AlignerJourney aj WHERE aj.patient.id = p.id) IS NULL
                    ) THEN 'ADD_TRACKING'
                    WHEN EXISTS (
                        SELECT 1 FROM TreatmentPlan tp2
                        WHERE tp2.patient.id = p.id
                        AND tp2.status = 'ACTIVE'
                        AND (SELECT COALESCE(MAX(aj.doctorTreatmentStartDate), bj.createdAt) FROM AlignerJourney aj WHERE aj.patient.id = p.id) > CURRENT_TIMESTAMP
                    ) THEN 'STARTING_SOON'
                    WHEN EXISTS (
                        SELECT 1 FROM TreatmentPlan tp2
                        WHERE tp2.patient.id = p.id
                        AND tp2.status = 'ACTIVE'
                        AND (SELECT COALESCE(MAX(aj.doctorTreatmentStartDate), bj.createdAt) FROM AlignerJourney aj WHERE aj.patient.id = p.id) <= CURRENT_TIMESTAMP
                    ) THEN 'ONGOING'
                    WHEN EXISTS (
                        SELECT 1 FROM TreatmentPlan tp2
                        WHERE tp2.patient.id = p.id
                        AND tp2.status = 'PAUSED'
                    ) THEN 'PAUSED'
                     WHEN EXISTS (
                        SELECT 1 FROM TreatmentPlan tp2
                        WHERE tp2.patient.id = p.id
                        AND tp2.status = 'COMPLETE'
                    ) THEN 'COMPLETE'
                    WHEN EXISTS (
                        SELECT 1 FROM TreatmentPlan tp2
                        WHERE tp2.patient.id = p.id
                        AND tp2.status = 'DRAFT'
                        AND NOT EXISTS (
                            SELECT 1 FROM TreatmentPlan tp3
                            WHERE tp3.patient.id = p.id
                            AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                        )
                    ) THEN 'IN_PLANNING'
                    WHEN EXISTS (
                        SELECT 1 FROM BracesJourney bj2
                        WHERE bj2.patient.id = p.id
                        AND bj2.bracesTreatmentStage = 'DRAFT'
                    ) THEN 'IN_PLANNING'
                    WHEN p.isGettingStartedMarkedAllAsRead = true
                        AND NOT EXISTS (
                            SELECT 1 FROM TreatmentPlan tp3
                            WHERE tp3.patient.id = p.id
                            AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                        )
                    THEN 'IN_PLANNING'
                    WHEN (
                        p.isGettingStartedMarkedAllAsRead = true OR
                        (
                            EXISTS (
                                SELECT 1 FROM File f0
                                WHERE f0.fullPath LIKE '/patients/%'
                                AND f0.status = 'ACTIVE'
                            )
                            AND EXISTS (
                                SELECT 1 FROM File f
                                WHERE f.fullPath LIKE CONCAT('/patients/', p.id, '/Images/Pre treatment photos%')
                                AND f.status = 'ACTIVE'
                            )
                            AND EXISTS (
                                SELECT 1 FROM File f
                                WHERE f.fullPath LIKE CONCAT('/patients/', p.id, '/3D Files/Scan files%')
                                AND f.status = 'ACTIVE'
                            )
                            AND EXISTS (
                                SELECT 1 FROM CaseInformation ci
                                WHERE ci.patientId = p.id
                            )
                        )
                    )
                    AND NOT EXISTS (
                        SELECT 1 FROM TreatmentPlan tp3
                        WHERE tp3.patient.id = p.id
                        AND (tp3.status = 'ACTIVE' OR tp3.status = 'DEACTIVATED' OR tp3.status = 'COMPLETE')
                    )
                    THEN 'IN_PLANNING'
                    ELSE 'ASSESSMENT'
                END AS treatmentStage
            FROM Patient p
            LEFT JOIN AlignerJourney aj ON aj.patient.id = p.id
            LEFT JOIN BracesJourney bj ON bj.patient.id = p.id
            WHERE p.id IN :patientIds
            AND p.patientStatus != 'ARCHIVE'
        """)
    List<TreatmentStageDTOSummery> findTreatmentStagesByPatientIds(@Param("patientIds") Set<Long> patientIds);

    @Query("SELECT "
            + "tp.id as id, "
            + "tp.treatmentPlanName as treatmentPlanName, "
            + "tp.status as status, "
            + "tp.alignerDetailsMetadata as alignerDetailsMetadata, "
            + "tp.treatmentType as treatmentType, "
            + "tp.treatmentPlanningLink as treatmentPlanningLink, "
            + "tp.treatmentPlanTagName as treatmentPlanTagName, "
            + "tp.isApprovedByPatient as isApprovedByPatient, "
            + "tp.approvedByPatientAt as approvedByPatientAt, "
            + "tp.orderStatusChangedAt as orderStatusChangedAt, "
            + "tp.initiatorStatus as initiatorStatus, "
            + "tp.approverStatus as approverStatus, "
            + "tp.createdAt as createdAt, "
            + "tp.treatmentPlanMetadata as treatmentPlanMetadata, "
            + "tp.stlFileMetadata as stlFileMetadata, "
            + "tp.patient.id as patientId, "
            + "tp.doctorId as doctorId, "
            + "ltp.id as linkedTreatmentPlanId, "
            + "ltp.initiatorStatus as linkedInitiatorStatus, "
            + "ltp.approverStatus as linkedApproverStatus, "
            + "ptp.id as parentLinkedTreatmentPlanId, "
            + "ptp.initiatorStatus as parentLinkedInitiatorStatus, "
            + "ptp.approverStatus as parentLinkedApproverStatus, "
            + "(SELECT COUNT(ltp2.id) FROM TreatmentPlan ltp2 WHERE ltp2.linkedTreatmentPlan = tp) as linkedTreatmentPlanCount, "
            + "o.id as orderId "
            + "FROM TreatmentPlan tp "
            + "LEFT JOIN tp.linkedTreatmentPlan ltp "
            + "LEFT JOIN TreatmentPlan ptp ON ptp.linkedTreatmentPlan = tp "
            + "LEFT JOIN tp.order o "
            + "WHERE tp.patient.id = :patientId "
            + "AND tp.treatmentSubType = :treatmentSubType "
            + "AND o.ownerProfile.id = :profileId "
            + "AND (:includeDrafts = true OR (tp.initiatorStatus != 'DRAFT' AND tp.approverStatus != 'DRAFT')) "
            + "ORDER BY tp.updatedAt DESC")
    List<TreatmentPlanSummary> findAlignerTreatmentSummariesByOwnerProfileId(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("profileId") Long profileId,
            @Param("includeDrafts") Boolean includeDrafts);

    @Query("SELECT "
            + "mb.treatmentPlan.id as treatmentPlanId, "
            + "mb.id as id, "
            + "mb.status as status, "
            + "mb.startDate as startDate, "
            + "mb.completionDate as completionDate, "
            + "mb.shippingDate as shippingDate, "
            + "mb.deliveryDate as deliveryDate, "
            + "mb.batchType as batchType, "
            + "mb.totalAligners as totalAligners, "
            + "mb.upperAlignerStart as upperAlignerStart, "
            + "mb.upperAlignerEnd as upperAlignerEnd, "
            + "mb.lowerAlignerStart as lowerAlignerStart, "
            + "mb.lowerAlignerEnd as lowerAlignerEnd, "
            + "mb.trackingNumber as trackingNumber, "
            + "mb.trackingLink as trackingLink, "
            + "mb.createdAt as createdAt "
            + "FROM ManufacturingBatch mb "
            + "WHERE mb.treatmentPlan.id IN :treatmentPlanIds "
            + "ORDER BY mb.treatmentPlan.id, mb.createdAt DESC")
    List<ManufacturingBatchProjection> findManufacturingBatchesByTreatmentPlanIds(
            @Param("treatmentPlanIds") List<Long> treatmentPlanIds);

    @Query("SELECT "
            + "tp.id as id, "
            + "tp.treatmentPlanName as treatmentPlanName, "
            + "tp.status as status, "
            + "tp.initiatorStatus as initiatorStatus, "
            + "tp.approverStatus as approverStatus, "
            + "tp.alignerDetailsMetadata as alignerDetailsMetadata, "
            + "tp.treatmentType as treatmentType, "
            + "tp.treatmentPlanningLink as treatmentPlanningLink, "
            + "tp.treatmentPlanTagName as treatmentPlanTagName, "
            + "tp.isApprovedByPatient as isApprovedByPatient, "
            + "tp.approvedByPatientAt as approvedByPatientAt, "
            + "tp.orderStatusChangedAt as orderStatusChangedAt, "
            + "tp.createdAt as createdAt, "
            + "tp.treatmentPlanMetadata as treatmentPlanMetadata, "
            + "tp.stlFileMetadata as stlFileMetadata, "
            + "tp.patient.id as patientId, "
            + "tp.doctorId as doctorId, "
            + "ltp.id as linkedTreatmentPlanId, "
            + "ltp.initiatorStatus as linkedInitiatorStatus, "
            + "ltp.approverStatus as linkedApproverStatus, "
            + "ptp.id as parentLinkedTreatmentPlanId, "
            + "ptp.initiatorStatus as parentLinkedInitiatorStatus, "
            + "ptp.approverStatus as parentLinkedApproverStatus, "
            + "(SELECT COUNT(ltp2.id) FROM TreatmentPlan ltp2 WHERE ltp2.linkedTreatmentPlan = tp) as linkedTreatmentPlanCount, "
            + "o.id as orderId "
            + "FROM TreatmentPlan tp "
            + "LEFT JOIN tp.linkedTreatmentPlan ltp "
            + "LEFT JOIN TreatmentPlan ptp ON ptp.linkedTreatmentPlan = tp "
            + "LEFT JOIN tp.order o "
            + "WHERE tp.patient.id = :patientId "
            + "AND tp.treatmentSubType = :treatmentSubType "
            + "AND (o.targetProfile.id = :profileId "
            + "     OR tp.outsourcedTo.id = :profileId "
            + "     OR EXISTS (SELECT 1 FROM ManufacturingBatch mb WHERE mb.treatmentPlan = tp AND mb.outsourcedTo.id = :profileId)) "
            + "AND (:includeDrafts = true OR (tp.initiatorStatus != 'DRAFT' AND tp.approverStatus != 'DRAFT')) "
            + "ORDER BY tp.updatedAt DESC")
    List<TreatmentPlanSummary> findAlignerTreatmentSummariesByTargetProfileId(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("profileId") Long profileId,
            @Param("includeDrafts") Boolean includeDrafts);

    @Query("SELECT "
            + "tp.id as id, "
            + "tp.treatmentPlanName as treatmentPlanName, "
            + "tp.status as status, "
            + "tp.alignerDetailsMetadata as alignerDetailsMetadata, "
            + "tp.treatmentType as treatmentType, "
            + "tp.treatmentPlanningLink as treatmentPlanningLink, "
            + "tp.treatmentPlanTagName as treatmentPlanTagName, "
            + "tp.isApprovedByPatient as isApprovedByPatient, "
            + "tp.approvedByPatientAt as approvedByPatientAt, "
            + "tp.orderStatusChangedAt as orderStatusChangedAt, "
            + "tp.initiatorStatus as initiatorStatus, "
            + "tp.approverStatus as approverStatus, "
            + "tp.createdAt as createdAt, "
            + "tp.treatmentPlanMetadata as treatmentPlanMetadata, "
            + "tp.stlFileMetadata as stlFileMetadata, "
            + "tp.patient.id as patientId, "
            + "tp.doctorId as doctorId, "
            + "ltp.id as linkedTreatmentPlanId, "
            + "ltp.initiatorStatus as linkedInitiatorStatus, "
            + "ltp.approverStatus as linkedApproverStatus "
            + "FROM TreatmentPlan tp "
            + "LEFT JOIN tp.linkedTreatmentPlan ltp "
            + "LEFT JOIN tp.order o "
            + "WHERE tp.patient.id = :patientId "
            + "AND (:treatmentSubType IS NULL OR tp.treatmentSubType = :treatmentSubType) "
            + "AND o.id IS NULL "
            + "AND (:includeDrafts = true OR (tp.initiatorStatus != 'DRAFT' AND tp.approverStatus != 'DRAFT')) "
            + "ORDER BY tp.updatedAt DESC")
    List<TreatmentPlanSummary> findAlignerTreatmentSummariesByPatientIdWhereOrderIsNull(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("includeDrafts") Boolean includeDrafts);

    @Query("SELECT "
            + "tp.id as id, "
            + "tp.treatmentPlanName as treatmentPlanName, "
            + "tp.status as status, "
            + "tp.alignerDetailsMetadata as alignerDetailsMetadata, "
            + "tp.treatmentType as treatmentType, "
            + "tp.treatmentPlanningLink as treatmentPlanningLink, "
            + "tp.treatmentPlanTagName as treatmentPlanTagName, "
            + "tp.isApprovedByPatient as isApprovedByPatient, "
            + "tp.approvedByPatientAt as approvedByPatientAt, "
            + "tp.orderStatusChangedAt as orderStatusChangedAt, "
            + "tp.initiatorStatus as initiatorStatus, "
            + "tp.approverStatus as approverStatus, "
            + "tp.createdAt as createdAt, "
            + "tp.treatmentPlanMetadata as treatmentPlanMetadata, "
            + "tp.stlFileMetadata as stlFileMetadata, "
            + "tp.patient.id as patientId, "
            + "tp.doctorId as doctorId, "
            + "ltp.id as linkedTreatmentPlanId, "
            + "ltp.initiatorStatus as linkedInitiatorStatus, "
            + "ltp.approverStatus as linkedApproverStatus "
            + "FROM TreatmentPlan tp "
            + "LEFT JOIN tp.linkedTreatmentPlan ltp "
            + "LEFT JOIN tp.order o "
            + "WHERE tp.patient.id = :patientId "
            + "AND (:treatmentSubType IS NULL OR tp.treatmentSubType = :treatmentSubType) "
            + "AND (:includeDrafts = true OR (tp.initiatorStatus != 'DRAFT' AND tp.approverStatus != 'DRAFT')) "
            + "ORDER BY tp.updatedAt DESC")
    List<TreatmentPlanSummary> findAlignerTreatmentSummariesByPatientId(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("includeDrafts") Boolean includeDrafts);

    @Query(
            """
    SELECT DISTINCT tp FROM TreatmentPlan tp
    LEFT JOIN FETCH tp.linkedTreatmentPlan
    LEFT JOIN FETCH tp.manufacturingBatches mb
    LEFT JOIN FETCH tp.shippingDetails tsd
    LEFT JOIN FETCH tp.order o
    LEFT JOIN FETCH o.shippingDetails sd
    WHERE tp.id = :id
""")
    Optional<TreatmentPlan> findByIdWithLinkedPlan(@Param("id") Long id);

    @Query(
            """
            SELECT COUNT(tp)
            FROM TreatmentPlan tp
            WHERE tp.orderId = :orderId
            AND (tp.initiatorStatus = :sentForApproval OR tp.initiatorStatus IS NULL)
            """)
    long countNonDraftTreatmentPlansByOrderId(
            @Param("orderId") String orderId, @Param("sentForApproval") OrderTreatmentPlanStatus sentForApproval);

    @Query(
            """
            SELECT tp FROM TreatmentPlan tp
            JOIN FETCH tp.order o
            WHERE tp.linkedTreatmentPlan.id = :linkedTreatmentPlanId
            """)
    Optional<TreatmentPlan> findByLinkedTreatmentPlanIdWithOrder(
            @Param("linkedTreatmentPlanId") Long linkedTreatmentPlanId);

    @Query("SELECT tp FROM TreatmentPlan tp " + "WHERE tp.order.id = :orderId " + "AND tp.patient.id = :patientId")
    List<TreatmentPlan> findTreatmentPlansByOrderIdAndPatientId(
            @Param("orderId") String orderId, @Param("patientId") Long patientId);

    @Query(
            """
            SELECT COUNT(DISTINCT o.id)
            FROM Order o
            WHERE o.targetProfile.id = :profileId
            AND o.status != 'DRAFT'
            AND EXISTS (
                SELECT 1 FROM o.ownerProfile.roles r
                WHERE r.name IN :roles
            )
            AND (
                (:statusName IS NULL)

                OR

                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM ManufacturingBatch mbSub WHERE mbSub.order = o
                ))

                OR

                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM ManufacturingBatch mbSub
                    WHERE mbSub.order = o
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM ManufacturingBatch mbInner
                          WHERE mbInner.order = o
                      )
                      AND mbSub.status = :status
                ))
            )
            """)
    Long countReceivedOrdersByProfileIdAndRoleId(
            @Param("profileId") Long profileId,
            @Param("roles") List<String> roles,
            @Param("status") ManufacturingStatus status,
            @Param("statusName") String statusName);

    @Query(
            """
            SELECT COUNT(DISTINCT o.id)
            FROM Order o
            WHERE o.ownerProfile.id = :profileId
            AND o.status != 'DRAFT'
            AND (
                (:statusName IS NULL)

                OR

                (:statusName = 'MANUFACTURING_PENDING' AND o.status = 'COMPLETED' AND NOT EXISTS (
                    SELECT 1 FROM ManufacturingBatch mbSub WHERE mbSub.order = o
                ))

                OR

                (:statusName != 'MANUFACTURING_PENDING' AND EXISTS (
                    SELECT 1 FROM ManufacturingBatch mbSub
                    WHERE mbSub.order = o
                      AND mbSub.id = (
                          SELECT MAX(mbInner.id)
                          FROM ManufacturingBatch mbInner
                          WHERE mbInner.order = o
                      )
                      AND mbSub.status = :status
                ))
            )
            """)
    Long countOfManufacturingPendingForPractice(
            @Param("profileId") Long profileId,
            @Param("status") ManufacturingStatus status,
            @Param("statusName") String statusName);

    @Query("SELECT tp FROM TreatmentPlan tp WHERE tp.orderId = :id ORDER BY tp.createdAt DESC")
    List<TreatmentPlan> findAllByOrderId(@Param("id") String id);

    @Query(
            """
    SELECT tp FROM TreatmentPlan tp
    LEFT JOIN FETCH tp.manufacturingBatches mb
    WHERE tp.id = :planId
""")
    Optional<TreatmentPlan> findTreatmentPlanWithManufacturing(@Param("planId") Long planId);

    @Query(
            """
    SELECT tp.id as id,
           tp.approverStatus as approverStatus,
           tp.initiatorStatus as initiatorStatus,
           tp.status as status,
           tp.orderId as orderId
    FROM TreatmentPlan tp
    WHERE tp.orderId IN :orderIds
    """)
    List<TreatmentPlanDetailsProjection> findTreatmentPlanDetailsByOrderIds(@Param("orderIds") List<String> orderIds);

    @Query(
            """
    SELECT CASE WHEN (COUNT(tp) > 0) THEN true ELSE false END
    FROM TreatmentPlan tp
    WHERE tp.patient.id IN :patientIds
      AND tp.tracking.status = :status
""")
    Boolean existsActiveTrackingForPatientIds(
            @Param("patientIds") List<Long> patientIds, @Param("status") Status status);

    @Query(
            """
        SELECT tp
        FROM TreatmentPlan tp
        LEFT JOIN FETCH tp.shippingDetails sd
        LEFT JOIN FETCH tp.manufacturingBatches mb
        LEFT JOIN FETCH tp.order linkedOrder
        LEFT JOIN Order orderByOrderId ON orderByOrderId.id = tp.orderId
        WHERE tp.patient.id = :patientId
            AND tp.treatmentSubType = :treatmentSubType
            AND (
                :orderId IS NULL
                OR tp.orderId = :orderId
                OR tp.orderId IS NULL
            )
            AND (
                tp.orderId IS NULL
                OR (orderByOrderId.ownerProfile.id = :profileId AND tp.approverStatus IS NOT NULL AND tp.initiatorStatus != 'IN_PROGRESS')
                OR (orderByOrderId.targetProfile.id = :profileId)
                OR (linkedOrder.ownerProfile.id = :profileId AND tp.approverStatus IS NOT NULL AND tp.initiatorStatus != 'IN_PROGRESS')
                OR (linkedOrder.targetProfile.id = :profileId)
                OR (orderByOrderId.ownerProfile.id IN :internalUserProfileIds AND tp.approverStatus IS NOT NULL AND tp.initiatorStatus != 'IN_PROGRESS')
                OR (orderByOrderId.targetProfile.id IN :internalUserProfileIds)
                OR (linkedOrder.ownerProfile.id IN :internalUserProfileIds AND tp.approverStatus IS NOT NULL AND tp.initiatorStatus != 'IN_PROGRESS')
                OR (linkedOrder.targetProfile.id IN :internalUserProfileIds)
                OR (tp.outsourcedTo.id = :profileId)
                OR (tp.outsourcedTo.id IN :internalUserProfileIds)
            )
            AND (
                :isInHouseManufacturingLab = false
                OR (
                    (orderByOrderId.orderType = 'PLANNING_ORDER' OR linkedOrder.orderType = 'PLANNING_ORDER')
                    AND (tp.initiatorStatus IS NULL OR tp.initiatorStatus != 'IN_PROGRESS')
                )
                OR (
                    (orderByOrderId.orderType IS NULL OR orderByOrderId.orderType != 'PLANNING_ORDER')
                    AND (linkedOrder.orderType IS NULL OR linkedOrder.orderType != 'PLANNING_ORDER')
                )
            )
        ORDER BY tp.updatedAt DESC
        """)
    List<TreatmentPlan> findByPatientIdOrderIdAndProfileIdWithRoleBasedFilter(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("orderId") String orderId,
            @Param("profileId") Long profileId,
            @Param("internalUserProfileIds") List<Long> internalUserProfileIds,
            @Param("isInHouseManufacturingLab") boolean isInHouseManufacturingLab);

    @Query(
            """
    SELECT DISTINCT tp
    FROM TreatmentPlan tp
    LEFT JOIN FETCH tp.shippingDetails sd
    LEFT JOIN FETCH tp.manufacturingBatches mb
    LEFT JOIN FETCH tp.order linkedOrder
    WHERE tp.patient.id = :patientId
        AND tp.treatmentSubType = :treatmentSubType
        AND (:orderId IS NULL OR tp.orderId = :orderId)
    ORDER BY tp.updatedAt DESC
    """)
    List<TreatmentPlan> findByPatientIdAndOrderId(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("orderId") String orderId);

    @Query(
            value =
                    """
SELECT DISTINCT
    tp.id as id,
    tp.orderId as orderId,
    tp.treatmentPlanName as treatmentPlanName,
    tp.treatmentPlanTagName as treatmentPlanTagName,
    tp.status as status,
    tp.treatmentType as treatmentType,
    tp.treatmentPlanningLink as treatmentPlanningLink,
    tp.doctorId as doctorId,
    tp.isApprovedByPatient as isApprovedByPatient,
    tp.approvedByPatientAt as approvedByPatientAt,
    tp.orderStatusChangedAt as orderStatusChangedAt,
    tp.initiatorStatus as initiatorStatus,
    tp.approverStatus as approverStatus,
    tp.createdAt as createdAt,
    tp.updatedAt as updatedAt,
    tp.alignerDetailsMetadata as alignerDetailsMetadata,
    tp.treatmentPlanMetadata as treatmentPlanMetadata,
    tp.stlFileMetadata as stlFileMetadata,
    tp.startDate as startDate,
    tp.endDate as endDate,
    tp.treatmentPlanVersion as treatmentPlanVersion,
    tp.remarks as remarks,
    tp.otherRemarks as otherRemarks,
    tp.daysToWearEachAligner as daysToWearEachAligner,
    ltp.id as linkedTreatmentPlanId,
    ltp.initiatorStatus as linkedInitiatorStatus,
    ltp.approverStatus as linkedApproverStatus,
    parentOrder.id as parentOrderId
FROM TreatmentPlan tp
LEFT JOIN tp.linkedTreatmentPlan ltp
LEFT JOIN Order linkedOrder ON linkedOrder.id = tp.orderId
LEFT JOIN linkedOrder.parentOrder parentOrder
WHERE (:patientId IS NULL OR tp.patient.id = :patientId)
  AND tp.treatmentSubType = :treatmentSubType
  AND (
      :orderId IS NULL
      OR tp.orderId = :orderId
      OR tp.orderId IS NULL
  )
  AND (
      tp.orderId IS NULL
      OR (linkedOrder.ownerProfile.id = :profileId AND tp.approverStatus IS NOT NULL)
      OR (linkedOrder.targetProfile.id = :profileId)
  )
ORDER BY tp.updatedAt DESC
""",
            countQuery =
                    """
SELECT COUNT(tp.id)
FROM TreatmentPlan tp
LEFT JOIN Order linkedOrder ON linkedOrder.id = tp.orderId
WHERE (:patientId IS NULL OR tp.patient.id = :patientId)
  AND tp.treatmentSubType = :treatmentSubType
  AND (
      :orderId IS NULL
      OR tp.orderId = :orderId
      OR tp.orderId IS NULL
  )
  AND (
      tp.orderId IS NULL
      OR (linkedOrder.ownerProfile.id = :profileId AND tp.approverStatus IS NOT NULL)
      OR (linkedOrder.targetProfile.id = :profileId)
  )
""")
    Page<TreatmentPlanProfileSummary> findProfileTreatmentSummaries(
            @Param("patientId") Long patientId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType,
            @Param("orderId") String orderId,
            @Param("profileId") Long profileId,
            Pageable pageable);

    @Query(
            nativeQuery = true,
            value =
                    """
                    SELECT COUNT(DISTINCT tp.patient_id)
                    FROM treatment_plan tp
                    LEFT JOIN patient p ON p.id = tp.patient_id
                    WHERE tp.outsourced_to_user_id = :profileId
                    AND (p.patient_status IS NULL OR p.patient_status != 'ARCHIVE')
                    """)
    Long countPatientsByProfileIdForTreatmentPlan(@Param("profileId") Long profileId);

    @Query("SELECT CASE WHEN COUNT(tp) > 0 THEN true ELSE false END " + "FROM TreatmentPlan tp "
            + "WHERE tp.order.id = :orderId "
            + "AND tp.patient.id = :patientId "
            + "AND tp.approverStatus = 'APPROVED'")
    boolean existsApprovedTreatmentPlan(@Param("orderId") String orderId, @Param("patientId") Long patientId);

    @Query(
            """
    SELECT
        tp.id as id,
        tp.patient.id as patientId,
        tp.status as status,
        tp.deactivatedAt as deactivatedAt,
        tp.reasonForDeactivation as treatmentDeactivatedReason,
        tp.otherRemarks as treatmentDeactivatedRemark
    FROM TreatmentPlan tp
    WHERE tp.patient.id IN :patientIds
    AND tp.treatmentSubType = :treatmentSubType
    AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
    AND tp.id = (
        SELECT MAX(t.id)
        FROM TreatmentPlan t
        WHERE t.patient.id = tp.patient.id
        AND t.treatmentSubType = :treatmentSubType
        AND t.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
    )
""")
    List<TreatmentPlanSummary> findLatestNonDraftTreatmentPlansByPatientIds(
            @Param("patientIds") Collection<Long> patientIds,
            @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Modifying
    @Query(
            """
    UPDATE TreatmentPlan tp
    SET tp.status = :status,
    tp.deactivatedAt = :deactivatedAt
    WHERE tp.patient.id = :patientId
      AND tp.id = :treatmentId
""")
    void updateStatus(Long patientId, Long treatmentId, AlignerTreatmentStatus status, LocalDate deactivatedAt);

    @Query(
            """
    SELECT COUNT(tp) > 0
    FROM TreatmentPlan tp
    WHERE tp.patient.id = :patientId
      AND tp.status IN ('DEACTIVATED', 'ARCHIVED')
""")
    Boolean isRefinementPatient(@Param("patientId") Long patientId);
}
