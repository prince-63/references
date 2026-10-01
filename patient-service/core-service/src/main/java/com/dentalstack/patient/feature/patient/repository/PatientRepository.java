package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.doctor.projection.AppInviteStatusCount;
import com.dentalstack.patient.feature.mcp.dto.summery.PatientDetailedSummary;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.projection.LiveActivitySummary;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import com.dentalstack.patient.feature.payment.enums.Status;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByMobileNo(String mobileNO);

    Optional<Patient> findByUUID(String uuid);

    List<Patient> findByDoctorIdAndPatientStatus(Long doctorId, PatientStatus patientStatus);

    List<Patient> findByDoctorId(Long doctorId);

    @Query("SELECT p.id as id, p.email as email, p.language as language FROM Patient p WHERE p.email IS NOT NULL")
    Page<LiveActivitySummary> findAllPatientsWithEmail(Pageable pageable);

    boolean existsByMobileNo(String mobile);

    boolean existsByEmail(String email);

    @Query(
            value =
                    "SELECT * FROM patient p WHERE (p.mobile_no = :mobile AND p.country_code = :countryCode) OR p.email = :email",
            nativeQuery = true)
    Optional<Patient> findByMobileAndCountryCodeOrEmail(String mobile, String countryCode, String email);

    @Query(
            value =
                    """
            SELECT * FROM
                patient p
            WHERE
                (p.patient_status = 'ACTIVE' OR p.patient_status = 'INACTIVE')
                AND p.id IN :mappedPatientIds
                AND (
                    CASE
                        WHEN p.first_name ILIKE CONCAT('%', :query, '%') THEN 1
                        ELSE 0
                    END +
                    CASE
                        WHEN p.last_name ILIKE CONCAT('%', :query, '%') THEN 1
                        ELSE 0
                    END +
                    CASE
                        WHEN p.email ILIKE CONCAT('%', :query, '%') THEN 1
                        ELSE 0
                    END +
                    CASE
                        WHEN p.customer_mapped_id ILIKE CONCAT('%', :query, '%') THEN 1
                        ELSE 0
                    END +
                    CASE
                        WHEN p.first_name ILIKE CONCAT('%', split_part(:query, ' ', 1), '%') AND p.last_name ILIKE CONCAT('%', split_part(:query, ' ', 2), '%') THEN 1
                        ELSE 0
                    END
                ) > 0
            ORDER BY
                CASE
                    WHEN p.first_name ILIKE CONCAT('%', :query, '%') THEN 1
                    WHEN p.last_name ILIKE CONCAT('%', :query, '%') THEN 2
                    WHEN p.email ILIKE CONCAT('%', :query, '%') THEN 3
                    WHEN p.customer_mapped_id ILIKE CONCAT('%', :query, '%') THEN 4
                    ELSE 5
                END
                                """,
            nativeQuery = true)
    List<Patient> findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedId(String query, List<Long> mappedPatientIds);

    @Query(
            """
                SELECT
                    p.id as patientId,
                    p.firstName as firstName,
                    p.lastName as lastName,
                    p.profilePictureUrl as profilePictureUrl,
                    p.profileImage.id as profilePictureId,
                    p.practiceLocationId as practiceLocationId,
                    p.createdAt as createdAt,
                    p.addedByUserId as doctorId,
                    p.patientStatus AS patientStatus,
                    p.productTypeNames as productTypeNames,
                    p.practiceLocationName as practiceLocationName,
                    FUNCTION('array_agg', DISTINCT t.id) as treatments
                FROM Patient p
                LEFT JOIN p.treatments t
                WHERE p.id IN :patientIds
                AND (
                    :query IS NULL OR :query = '' OR (
                        LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%'))
                        OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
                        OR LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))
                        OR LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :query, '%'))
                        OR (
                            LOWER(p.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :query, ' ', 1), '%'))
                            AND LOWER(p.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :query, ' ', 2), '%'))
                        )
                    )
                )
                GROUP BY p.id, p.firstName, p.lastName, p.profilePictureUrl,
                         p.practiceLocationId, p.createdAt, p.addedByUserId,
                         p.productTypeNames, p.practiceLocationName
                ORDER BY
                    CASE
                        WHEN :query IS NOT NULL AND :query != '' THEN (
                            CASE
                                WHEN LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) THEN 1
                                WHEN LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) THEN 2
                                WHEN LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%')) THEN 3
                                WHEN LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :query, '%')) THEN 4
                                ELSE 5
                            END
                        )
                        ELSE 6
                    END
            """)
    List<PatientSummary> findByQueryOnFirstNameOrLastNameOrEmailOrCustomerMappedIdForPatientSummary(
            @Param("query") String query, @Param("patientIds") List<Long> patientIds);

    List<Patient> findByAddedByUserId(Long doctorId);

    @Query("SELECT p.id AS patientId, p.firstName AS firstName, p.lastName AS lastName, "
            + "p.profilePictureUrl AS profilePictureUrl "
            + "FROM Patient p "
            + "WHERE p.id = :patientId")
    PatientSummary findPatientSummaryById(@Param("patientId") Long patientId);

    @Query(
            """
                SELECT
                    p.id as patientId,
                    p.firstName as firstName,
                    p.lastName as lastName,
                    p.profilePictureUrl as profilePictureUrl,
                    p.profileImage.id as profilePictureId,
                    p.practiceLocationId as practiceLocationId,
                    p.createdAt as createdAt,
                    p.addedByUserId as doctorId,
                    p.productTypeNames as productTypeNames,
                    p.practiceLocationName as practiceLocationName,
                    FUNCTION('array_agg', DISTINCT t.id) as treatments
                FROM Patient p
                LEFT JOIN p.treatments t
                WHERE p.id IN :patientIds
                GROUP BY p.id, p.firstName, p.lastName, p.profilePictureUrl,
                         p.practiceLocationId, p.createdAt, p.addedByUserId,
                         p.productTypeNames, p.practiceLocationName
            """)
    List<PatientSummary> findByPatientIdsWithSummary(List<Long> patientIds);

    @Query(
            "SELECT DISTINCT p.id AS patientId, p.firstName AS firstName, p.lastName AS lastName, p.patientType as patientType,"
                    + "p.practiceLocationId AS practiceLocationId, p.profilePictureUrl AS profilePictureUrl, "
                    + "(CASE WHEN aj.id IS NOT NULL THEN true ELSE false END) AS isTrackingAdded, "
                    + "(CASE WHEN t.id IS NOT NULL THEN true ELSE false END) AS isTreatmentAdded, "
                    + "COALESCE(t.cost - SUM(CASE WHEN pay.status = :activeStatus THEN pay.amount ELSE 0 END), t.cost) AS amountDue, "
                    + "(CASE WHEN EXISTS (SELECT 1 FROM Order o WHERE o.patient.id = p.id AND o.status != 'COMPLETED') THEN true ELSE false END) AS hasOngoingOrders, "
                    + "(CASE WHEN EXISTS (SELECT 1 FROM Order o WHERE o.patient.id = p.id) THEN true ELSE false END) AS hasAnyOrders "
                    + "FROM PatientDoctorOrganization pdo "
                    + "INNER JOIN Patient p ON p.id = pdo.patient.id "
                    + "LEFT JOIN AlignerJourney aj ON aj.patient.id = p.id "
                    + "LEFT JOIN Treatment t ON t.patient.id = p.id "
                    + "LEFT JOIN Payment pay ON pay.fromUserId = p.id "
                    + "WHERE pdo.doctor.id = :doctorId "
                    + "AND pdo.organization.id = :organizationId "
                    + "AND pdo.userProfile.id = :profileId "
                    + "GROUP BY p.id, p.firstName, p.lastName, p.practiceLocationId, p.profilePictureUrl, aj.id, t.id, t.cost")
    List<PatientSummary> findPatientSummariesByDoctorOrgAndProfile(
            @Param("doctorId") Long doctorId,
            @Param("profileId") Long profileId,
            @Param("organizationId") Long organizationId,
            @Param("activeStatus") Status activeStatus);

    @Query("SELECT DISTINCT p.id AS patientId, p.firstName AS firstName, p.lastName AS lastName, "
            + "p.profilePictureUrl AS profilePictureUrl, "
            + "(CASE WHEN aj.id IS NOT NULL THEN true ELSE false END) AS isTrackingAdded, "
            + "COALESCE(t.cost - SUM(CASE WHEN pay.status = :activeStatus THEN pay.amount ELSE 0 END), t.cost) AS amountDue "
            + "FROM Patient p "
            + "LEFT JOIN AlignerJourney aj ON aj.patient = p "
            + "LEFT JOIN Treatment t ON t.patient = p "
            + "LEFT JOIN Payment pay ON pay.fromUserId = p.id "
            + "WHERE p.id = :patientId "
            + "GROUP BY p.id, p.firstName, p.lastName, p.profilePictureUrl, aj.id, t.id, t.cost")
    PatientSummary findPatientSummariesByPatientId(
            @Param("patientId") Long patientId, @Param("activeStatus") Status activeStatus);

    @Query(
            """
            SELECT p
            FROM Patient p
            LEFT JOIN FETCH p.doctorOrganization do
            LEFT JOIN FETCH do.doctor d
            LEFT JOIN FETCH do.organization o
            LEFT JOIN FETCH do.userProfile up
            LEFT JOIN FETCH do.addedByUserProfile aup
            LEFT JOIN FETCH aup.organization oaup
            LEFT JOIN FETCH up.user u
            WHERE p.id = :id
            """)
    Optional<Patient> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COALESCE(p.isGettingStartedMarkedAllAsRead, false) FROM Patient p WHERE p.id = :patientId")
    Optional<Boolean> findIsGettingStartedMarkedAllAsReadByIdOptional(@Param("patientId") Long patientId);

    @Query(
            """
            SELECT p
            FROM Patient p
            LEFT JOIN FETCH p.doctorOrganization do
            LEFT JOIN FETCH do.doctor d
            LEFT JOIN FETCH do.organization o
            LEFT JOIN FETCH do.userProfile up
            LEFT JOIN FETCH do.orgUserProfile orup
            LEFT JOIN FETCH up.organization op
            LEFT JOIN FETCH up.user u
            LEFT JOIN FETCH up.doctor ud
            LEFT JOIN FETCH up.roles ur
            LEFT JOIN FETCH up.doctorBilling udb
            LEFT JOIN FETCH do.addedByUserProfile abup
            LEFT JOIN FETCH abup.user abu
            LEFT JOIN FETCH abup.roles abr
            LEFT JOIN FETCH abup.doctorBilling adb
            WHERE p.id = :id
            """)
    Optional<Patient> findByIdWithDoctorProfileDetails(@Param("id") Long id);

    @Query(
            """
            SELECT p.id AS patientId,
                   p.firstName AS firstName,
                   p.lastName AS lastName,
                   p.practiceLocationName AS practiceLocationName,
                   p.email AS email,
                   p.mobileNo AS mobile,
                   p.createdAt AS invitedAt,
                   p.productTypeName AS productTypes,
                   p.productTypeNames AS productTypeNames,
                   p.profilePictureUrl AS profileImage,
                   p.UUID AS uuid,
                   p.chiefComplaint AS chiefComplaint,
                   p.archivedAt AS archivedAt,
                   p.countryCode AS countryCode,
                   p.patientStatus AS patientStatus,
                   pdo.doctor.id AS practiceDoctorId,
                   pdo.userProfile.id AS practiceProfileId,
                   pdo.organization.id AS practiceOrganizationId,
                   CASE
                       WHEN up.user.displayName IS NOT NULL THEN up.user.displayName
                       ELSE TRIM(CONCAT(
                           CASE
                               WHEN up.user.salutation IS NOT NULL AND up.user.salutation != ''
                               THEN CONCAT(up.user.salutation, '. ')
                               ELSE ''
                           END,
                           CASE
                               WHEN up.user.firstName IS NOT NULL AND up.user.firstName != ''
                               THEN CONCAT(up.user.firstName, ' ')
                               ELSE ''
                           END,
                           CASE
                               WHEN up.user.lastName IS NOT NULL AND up.user.lastName != ''
                               THEN up.user.lastName
                               ELSE ''
                           END
                       ))
                   END AS practiceName
            FROM Patient p
            LEFT JOIN p.doctorOrganization pdo
            LEFT JOIN pdo.userProfile up
            WHERE p.id IN :patientIds
            """)
    List<PatientSummary> findPatientSummaryWithOrganizationDetails(@Param("patientIds") List<Long> patientIds);

    Optional<Patient> findByCustomerMappedId(String string);

    @Query(
            value =
                    """
            SELECT
                COALESCE(COUNT(DISTINCT CASE WHEN i.status = 5 THEN pdo.patient_id END), 0) as "connectedCount",
                COALESCE(COUNT(DISTINCT CASE WHEN i.status = 0 AND i.is_invitation_sent = true THEN pdo.patient_id END), 0) as "pendingCount",
                COALESCE(COUNT(DISTINCT CASE WHEN i.status IS NULL
                            OR (i.status = 0 AND i.is_invitation_sent = false)
                            OR (i.status NOT IN (0, 5)) THEN pdo.patient_id END), 0) as "notConnectedCount"
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            LEFT JOIN patient_invitation_details pid ON pid.patient_id = pdo.patient_id
            LEFT JOIN invitation i ON pid.invitation_id = i.id
            WHERE pdo.organization_id = :organizationId
            AND p.patient_status != 'ARCHIVE'
            AND EXISTS (
                SELECT 1 FROM user_profile_role upr
                JOIN role r ON r.id = upr.role_id
                WHERE upr.user_profile_id = pdo.user_profile_id
                AND r.name IN (:roles)
            )
            """,
            nativeQuery = true)
    AppInviteStatusCount getAppInviteStatusCountsByOrganization(
            @Param("organizationId") Long organizationId, @Param("roles") List<String> roles);

    @Query(
            value =
                    """
            SELECT
                COALESCE(SUM(CASE WHEN i.status = 5 THEN 1 ELSE 0 END), 0) as "connectedCount",
                COALESCE(SUM(CASE WHEN i.status = 0 AND i.is_invitation_sent = true THEN 1 ELSE 0 END), 0) as "pendingCount",
                COALESCE(SUM(CASE WHEN i.status IS NULL
                            OR (i.status = 0 AND i.is_invitation_sent = false)
                            OR (i.status NOT IN (0, 5)) THEN 1 ELSE 0 END), 0) as "notConnectedCount"
            FROM patient_doctor_organization pdo
            JOIN patient p ON p.id = pdo.patient_id
            LEFT JOIN patient_invitation_details pid ON pid.patient_id = pdo.patient_id
            LEFT JOIN invitation i ON pid.invitation_id = i.id
            WHERE pdo.organization_id = :organizationId
            AND pdo.user_profile_id = :profileId
            AND p.patient_status != 'ARCHIVE'
            """,
            nativeQuery = true)
    AppInviteStatusCount getAppInviteStatusCountsByOrganizationAndUserProfile(
            @Param("organizationId") Long organizationId, @Param("profileId") Long profileId);

    @Query("SELECT p FROM Patient p WHERE p.id = :patientId")
    Patient findByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT
        p.id AS patientId,
        p.firstName AS firstName,
        p.lastName AS lastName,
        p.email AS email,
        p.mobileNo AS mobileNumber,
        p.customerMappedId AS customerMappedId,
        p.profilePictureUrl AS profilePictureUrl,
        p.UUID AS uuid,

        CAST(COUNT(DISTINCT tp.id) AS long) AS totalTreatmentPlans,

        CAST(SUM(CASE WHEN tp.status = 'DRAFT' AND tp.initiatorStatus = 'IN_PROGRESS'
            THEN 1 ELSE 0 END) AS long) AS draftInProgressCount,
        CAST(SUM(CASE WHEN tp.initiatorStatus = 'IN_PROGRESS'
            THEN 1 ELSE 0 END) AS long) AS inProgressCount,
        CAST(SUM(CASE WHEN tp.initiatorStatus = 'SENT_FOR_APPROVAL'
            THEN 1 ELSE 0 END) AS long) AS sentForApprovalCount,
        CAST(SUM(CASE WHEN tp.initiatorStatus = 'PENDING_APPROVAL'
            THEN 1 ELSE 0 END) AS long) AS pendingApprovalCount,
        CAST(SUM(CASE WHEN tp.initiatorStatus = 'APPROVED'
            THEN 1 ELSE 0 END) AS long) AS approvedCount,
        CAST(SUM(CASE WHEN tp.status = 'ACTIVE'
            THEN 1 ELSE 0 END) AS long) AS activeCount,
        CAST(SUM(CASE WHEN tp.status = 'ARCHIVED'
            THEN 1 ELSE 0 END) AS long) AS archivedCount,
        CAST(SUM(CASE WHEN tp.initiatorStatus = 'RE_PLAN'
            THEN 1 ELSE 0 END) AS long) AS rePlanCount,
        CAST(SUM(CASE WHEN tp.status = 'DEACTIVATED'
            THEN 1 ELSE 0 END) AS long) AS deactivatedCount,

        CAST(COUNT(DISTINCT o.id) AS long) AS totalOrders,
        CAST(SUM(CASE WHEN o.status = 'ORDERED' THEN 1 ELSE 0 END) AS long) AS orderedCount,
        CAST(SUM(CASE WHEN o.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS long) AS orderInProgressCount,
        CAST(SUM(CASE WHEN o.status = 'IN_REVIEW' THEN 1 ELSE 0 END) AS long) AS orderInReviewCount,
        CAST(SUM(CASE WHEN o.status = 'ON_HOLD' THEN 1 ELSE 0 END) AS long) AS orderOnHoldCount,
        CAST(SUM(CASE WHEN o.status = 'RE_PLAN' THEN 1 ELSE 0 END) AS long) AS orderRePlanCount,
        CAST(SUM(CASE WHEN o.status = 'APPROVED' THEN 1 ELSE 0 END) AS long) AS orderApprovedCount,
        CAST(SUM(CASE WHEN o.status = 'COMPLETED' THEN 1 ELSE 0 END) AS long) AS orderCompletedCount,
        CAST(SUM(CASE WHEN o.status = 'DRAFT' THEN 1 ELSE 0 END) AS long) AS orderDraftCount,
        CAST(SUM(CASE WHEN o.status = 'NEED_MORE_INFO' THEN 1 ELSE 0 END) AS long) AS orderNeedMoreInfoCount,
        CAST(SUM(CASE WHEN o.status = 'CANCELLED' THEN 1 ELSE 0 END) AS long) AS orderCancelledCount,
        CAST(SUM(CASE WHEN o.status = 'STL_FILES_REQUESTED' THEN 1 ELSE 0 END) AS long) AS orderStlFilesRequestedCount,
        CAST(SUM(CASE WHEN o.status = 'STL_FILES_UPLOADED' THEN 1 ELSE 0 END) AS long) AS orderStlFilesUploadedCount,
        CAST(SUM(CASE WHEN o.assignedLabUserId IS NULL THEN 1 ELSE 0 END) AS long) AS orderUnassignedCount,
        CAST(SUM(CASE WHEN o.isUrgent = true THEN 1 ELSE 0 END) AS long) AS orderUrgentCount,

        CAST(COUNT(DISTINCT mb.id) AS long) AS totalManufacturingBatches,
        COALESCE(CAST(SUM(CASE WHEN mb.status = 'DELIVERED' THEN mb.totalAligners ELSE 0 END) AS integer), 0) AS totalAlignersDelivered,
        COALESCE(CAST(SUM(CASE WHEN mb.status = 'IN_INVENTORY' THEN mb.totalAligners ELSE 0 END) AS integer), 0) AS totalAlignersInInventory,
        COALESCE(CAST(SUM(CASE WHEN mb.status IN ('IN_TRANSIT', 'SHIPPED') THEN mb.totalAligners ELSE 0 END) AS integer), 0) AS totalAlignersInTransit,
        COALESCE(CAST(SUM(CASE WHEN mb.status IN ('PENDING', 'IN_PRODUCTION') THEN mb.totalAligners ELSE 0 END) AS integer), 0) AS totalAlignersPending,

        CASE WHEN COUNT(DISTINCT cr.id) > 0 THEN true ELSE false END AS caseRecordAdded,
        CASE WHEN COUNT(DISTINCT pr.id) > 0 THEN true ELSE false END AS prescriptionAdded,
        CASE WHEN COUNT(DISTINCT aj.id) > 0 THEN true ELSE false END AS alignerJourneyAdded,

        CASE
            WHEN MAX(aj.doctorTreatmentStartDate) IS NULL THEN false
            WHEN MAX(aj.doctorTreatmentStartDate) <= CURRENT_DATE THEN true
            ELSE false
        END AS treatmentStarted,

        CAST(COUNT(DISTINCT aj.id) AS long) AS totalAlignerJourneys,
        CAST(SUM(CASE WHEN aj.progressStatus = 'NOT_STARTED' THEN 1 ELSE 0 END) AS long) AS alignerJourneyNotStartedCount,
        CAST(SUM(CASE WHEN aj.progressStatus = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS long) AS alignerJourneyInProgressCount,
        CAST(SUM(CASE WHEN aj.progressStatus = 'COMPLETED' THEN 1 ELSE 0 END) AS long) AS alignerJourneyCompletedCount,
        CAST(SUM(CASE WHEN aj.progressStatus = 'DEACTIVATED' THEN 1 ELSE 0 END) AS long) AS alignerJourneyDeactivatedCount,
        CAST(SUM(CASE WHEN aj.progressStatus = 'ON_HOLD' THEN 1 ELSE 0 END) AS long) AS alignerJourneyOnHoldCount,
        CAST(SUM(CASE WHEN aj.progressStatus = 'CANCELLED' THEN 1 ELSE 0 END) AS long) AS alignerJourneyCancelledCount

    FROM Patient p
    LEFT JOIN p.doctorOrganization pdo
    LEFT JOIN TreatmentPlan tp ON tp.patient = p
    LEFT JOIN Order o ON o.patient = p
    LEFT JOIN ManufacturingBatch mb ON mb.patient = p
    LEFT JOIN CaseRecord cr ON cr.patient = p
    LEFT JOIN Prescription pr ON pr.patient = p
    LEFT JOIN AlignerJourney aj ON aj.patient = p

    WHERE pdo.organization.id = :organizationId
        AND (:searchQuery IS NULL OR :searchQuery = '' OR (
            LOWER(p.firstName) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
            OR LOWER(p.lastName) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
            OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
            OR LOWER(p.mobileNo) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
            OR LOWER(p.customerMappedId) LIKE LOWER(CONCAT('%', :searchQuery, '%'))
            OR (
                LOWER(p.firstName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :searchQuery, ' ', 1), '%'))
                AND LOWER(p.lastName) LIKE LOWER(CONCAT('%', FUNCTION('split_part', :searchQuery, ' ', 2), '%'))
            )
        ))

    GROUP BY p.id, p.firstName, p.lastName, p.email, p.mobileNo,
             p.customerMappedId, p.profilePictureUrl, p.UUID

    ORDER BY p.firstName ASC, p.lastName ASC
    """)
    List<PatientDetailedSummary> findPatientsWithDetailedSummary(
            @Param("organizationId") Long organizationId, @Param("searchQuery") String searchQuery);
}
