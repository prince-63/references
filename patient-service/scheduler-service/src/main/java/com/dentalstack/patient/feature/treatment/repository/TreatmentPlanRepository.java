package com.dentalstack.patient.feature.treatment.repository;

import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.treatment.entity.TreatmentPlan;
import com.dentalstack.patient.feature.treatment.enums.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.treatment.projection.DashboardTreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.projections.TreatmentPlanSummary;
import com.dentalstack.patient.feature.treatment.projections.TreatmentStageDTOSummery;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TreatmentPlanRepository extends JpaRepository<TreatmentPlan, Long> {

    @Query("SELECT a FROM TreatmentPlan a WHERE a.patient.id = ?1 and a.treatmentSubType = ?2")
    List<TreatmentPlan> findByPatientAndTreatmentSubType(Long patientId, ProductTypeName treatmentSubType);

    @Query(
            "SELECT MAX(tp.deactivatedAt) FROM TreatmentPlan tp WHERE tp.patient.id = :patientId AND tp.doctorId = :doctorId AND tp.treatmentSubType = :treatmentSubType AND tp.status = 'DEACTIVATED'")
    Optional<LocalDate> findLatestDeactivationDate(
            @Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query(
            "SELECT t FROM TreatmentPlan t JOIN FETCH t.tracking WHERE t.patient.id = :patientId AND t.treatmentSubType = :treatmentSubType")
    List<TreatmentPlan> findByPatientAndDoctorIdAndTreatmentSubTypeWithTracking(
            @Param("patientId") Long patientId, @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query(
            "SELECT t FROM TreatmentPlan t JOIN FETCH t.tracking WHERE t.doctorId = :doctorId AND t.treatmentSubType IN :treatmentSubTypes")
    List<TreatmentPlan> findByDoctorIdAndTreatmentSubTypesWithTracking(
            @Param("doctorId") Long doctorId, @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes);

    @Query("SELECT t.id AS id, t.patient.id AS patientId, t.status AS status " + "FROM TreatmentPlan t "
            + "WHERE t.patient.id IN :patientIds "
            + "AND t.treatmentSubType IN :treatmentSubTypes "
            + "AND t.status != :draftStatus "
            + "AND EXISTS (SELECT 1 FROM Tracking tr WHERE tr.treatmentPlan = t)")
    List<DashboardTreatmentPlanSummary> findNonDraftTreatmentPlansByPatientIdsForDashboard(
            @Param("patientIds") List<Long> patientIds,
            @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes,
            @Param("draftStatus") AlignerTreatmentStatus draftStatus);

    @Query("SELECT t.patient.id AS patientId, t.status AS status, t.tracking.status AS trackingStatus "
            + "FROM TreatmentPlan t JOIN t.tracking "
            + "WHERE t.patient.id IN :patientIds AND t.treatmentSubType IN :treatmentSubTypes")
    List<TreatmentPlanSummary> findTreatmentPlanSummariesByPatientIdsAndTreatmentSubTypes(
            @Param("patientIds") List<Long> patientIds,
            @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes);

    @Query("SELECT t.patient.id AS patientId, t.status AS status, t.tracking.status AS trackingStatus "
            + "FROM TreatmentPlan t JOIN t.tracking "
            + "WHERE t.doctorId = :doctorId AND t.treatmentSubType IN :treatmentSubTypes")
    List<TreatmentPlanSummary> findTreatmentPlanSummariesByDoctorIdAndTreatmentSubTypes(
            @Param("doctorId") Long doctorId, @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes);

    @Query(
            "SELECT t FROM TreatmentPlan t WHERE t.patient.id = :patientId AND t.doctorId = :doctorId AND t.treatmentSubType = :treatmentSubType")
    List<TreatmentPlan> findByPatientIdAndDoctorIdAndTreatmentSubType(
            @Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId,
            @Param("treatmentSubType") ProductTypeName treatmentSubType);

    List<TreatmentPlan> findByPatientIdAndDoctorIdAndStatusIn(
            Long patientId, Long doctorId, List<AlignerTreatmentStatus> statuses);

    List<TreatmentPlan> findByPatientIdAndStatusIn(Long patientId, List<AlignerTreatmentStatus> alignerTreatmentStatus);

    Optional<TreatmentPlan> findByPatientIdAndStatus(Long patientId, AlignerTreatmentStatus alignerTreatmentStatus);

    List<TreatmentPlan> findByStatus(AlignerTreatmentStatus alignerTreatmentStatus);

    @Query("SELECT tp FROM TreatmentPlan tp JOIN FETCH tp.tracking WHERE tp.id = :treatmentPlanId")
    Optional<TreatmentPlan> findByIdWithTracking(@Param("treatmentPlanId") Long treatmentPlanId);

    Integer countByPatientId(Long patientId);

    @Query("SELECT t FROM TreatmentPlan t JOIN FETCH t.tracking " + "WHERE t.patient.id = :patientId "
            + "AND t.treatmentSubType = :treatmentSubType "
            + "AND t.status = 'ACTIVE'")
    Optional<TreatmentPlan> findActiveTreatmentPlanByPatientIdAndTreatmentSubTypeWithTracking(
            @Param("patientId") Long patientId, @Param("treatmentSubType") ProductTypeName treatmentSubType);

    @Query("SELECT DISTINCT tp.patient.id FROM TreatmentPlan tp " + "WHERE tp.doctorId = :doctorId "
            + "AND tp.patient.id IN :patientIds "
            + "AND tp.status = :status")
    List<Long> findPatientIdsWithTreatmentPlansByStatus(
            @Param("doctorId") Long doctorId,
            @Param("patientIds") List<Long> patientIds,
            @Param("status") AlignerTreatmentStatus status);

    List<TreatmentPlan> findByPatientId(Long patientId);

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
                COALESCE(up_inviter_user.email, u.email) as userEmail,
                up.organizationBrandName as orgName
            FROM TreatmentPlan tp
            LEFT JOIN tp.order o
            LEFT JOIN tp.patient p
            LEFT JOIN p.doctorOrganization do
            LEFT JOIN do.addedByUserProfile up
            LEFT JOIN up.user u
            LEFT JOIN up.inviterProfile up_inviter
            LEFT JOIN up_inviter.user up_inviter_user
            WHERE tp.status = 'ACTIVE'
            AND EXISTS (
                SELECT 1 FROM AlignerJourney aj
                WHERE aj.patient = p
            )
            """)
    Page<TreatmentPlanSummary> findAllActiveTreatmentPlans(Pageable pageable);

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

    @Query("SELECT " + "tp.id as id, "
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
            + "tp.orderId as orderId "
            + "FROM TreatmentPlan tp "
            + "WHERE tp.patient.id = :patientId "
            + "AND tp.treatmentSubType = :treatmentSubType "
            + "ORDER BY tp.updatedAt DESC")
    List<TreatmentPlanSummary> findAlignerTreatmentSummaries(
            @Param("patientId") Long patientId, @Param("treatmentSubType") ProductTypeName treatmentSubType);

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
                AND tp2.status = 'ACTIVE'
            ) THEN 'ADD_TRACKING'
            WHEN EXISTS (
                SELECT 1 FROM TreatmentPlan tp2
                WHERE tp2.patient.id = p.id
                AND tp2.status = 'DRAFT'
            ) THEN 'IN_PLANNING'
            WHEN EXISTS (
                SELECT 1 FROM BracesJourney bj2
                WHERE bj2.patient.id = p.id
                AND bj2.bracesTreatmentStage = 'ACTIVE'
            ) THEN 'ADD_TRACKING'
            WHEN EXISTS (
                SELECT 1 FROM BracesJourney bj2
                WHERE bj2.patient.id = p.id
                AND bj2.bracesTreatmentStage = 'DRAFT'
            ) THEN 'IN_PLANNING'
            WHEN (
                p.isGettingStartedMarkedAllAsRead = true OR
                (EXISTS (
                    SELECT 1 FROM File f
                    WHERE f.fullPath LIKE CONCAT('/patients/', p.id, '/Images/Pre treatment photos%')
                    AND f.status = 'ACTIVE'
                ) AND
                EXISTS (
                    SELECT 1 FROM File f
                    WHERE f.fullPath LIKE CONCAT('/patients/', p.id, '/3D Files/Scan files%')
                    AND f.status = 'ACTIVE'
                ) AND
                EXISTS (
                    SELECT 1 FROM CaseInformation ci
                    WHERE ci.patientId = p.id
                ))
            ) THEN 'IN_PLANNING'
            ELSE 'ASSESSMENT'
        END AS treatmentStage
    FROM Patient p
    WHERE p.id IN :patientIds
    AND p.patientStatus != 'ARCHIVE'
""")
    List<TreatmentStageDTOSummery> findTreatmentStagesByPatientIds(@Param("patientIds") Set<Long> patientIds);
}
