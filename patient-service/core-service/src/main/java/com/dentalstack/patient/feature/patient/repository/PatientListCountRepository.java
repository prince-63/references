package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.doctor.entity.PatientDoctorOrganization;
import feign.Param;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientListCountRepository extends JpaRepository<PatientDoctorOrganization, Long> {

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
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
                AND o.status NOT IN ('DRAFT')
            )
            AND NOT EXISTS (
                SELECT 1 FROM TreatmentPlan tp
                WHERE tp.patient.id = pdo.patient.id
                AND tp.status IN ('ACTIVE', 'PAUSED','DEACTIVATED','COMPLETE')
            )
            """)
    Long countAssessmentPatientsForOrganization(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
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
            """)
    Long countAssessmentPatientsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
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
                SELECT 1 FROM TreatmentPlan tp
                WHERE tp.patient.id = pdo.patient.id
                AND tp.status IN ('ACTIVE', 'PAUSED', 'DEACTIVATED')
            )
            AND EXISTS (
                SELECT 1 FROM Order o
                WHERE o.patient.id = pdo.patient.id
                AND o.status NOT IN ('DRAFT', 'COMPLETED')
            )
            """)
    Long planningCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query("SELECT COUNT(DISTINCT pdo.patient.id) " + "FROM PatientDoctorOrganization pdo "
            + "LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id "
            + "LEFT JOIN Invitation i ON pid.invitation.id = i.id "
            + "WHERE pdo.doctor.id = :doctorId "
            + "AND pdo.organization.id = :organizationId "
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
            + ")")
    Long planningCountsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Tracking t ON t.treatmentPlan.id = tp.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long manufacturingCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Tracking t ON t.treatmentPlan.id = tp.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
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
            """)
    Long manufacturingCountsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN ManufacturingBatch mb ON mb.treatmentPlan.id = tp.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long transitCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN ManufacturingBatch mb ON mb.treatmentPlan.id = tp.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
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
            """)
    Long transitCountsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            LEFT JOIN Tracking t ON t.treatmentPlan.id = tp.id
            LEFT JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            LEFT JOIN ManufacturingBatch mb ON mb.treatmentPlan.id = tp.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long startingSoonCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
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
            """)
    Long startingSoonCountsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long pausedCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
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
            """)
    Long pausedPatientIdsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long ongoingCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
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
            """)
    Long ongoingCountsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            INNER JOIN TreatmentPlan tp ON tp.patient.id = pdo.patient.id
            INNER JOIN Tracking t ON t.treatmentPlan.id = tp.id
            INNER JOIN AlignerJourney aj ON t.alignerJourney.id = aj.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long treatmentCompletedCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
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
            """)
    Long treatmentCompleteCountsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long refinementCountsForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
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
            """)
    Long refinementCountsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
    SELECT COUNT(DISTINCT pdo.patient.id)
    FROM PatientDoctorOrganization pdo
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
    LEFT JOIN Invitation i ON pid.invitation.id = i.id
    WHERE pdo.organization.id = :organizationId
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
    """)
    Long getPatientCountForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
    SELECT COUNT(DISTINCT pdo.patient.id)
    FROM PatientDoctorOrganization pdo
    LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
    LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
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
    """)
    Long getAllPatientCountForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
    SELECT COUNT(DISTINCT pdo.patient.id)
    FROM PatientDoctorOrganization pdo
    WHERE pdo.doctor.id = :doctorId
    AND pdo.organization.id = :organizationId
    AND pdo.userProfile.id = :profileId
    AND pdo.patient.patientStatus != 'ARCHIVE'
    """)
    Long getAllPatientCountForCustomer(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);

    @Query(
            """
    SELECT COUNT(DISTINCT o.patient.id)
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
    """)
    Long countPatientIdOfAllCustomerPatientForOrg(
            @Param("targetProfileId") Long targetProfileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND pdo.userProfile.id = :profileId
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
            """)
    Long combinedActivePatientCountForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("practiceLocationId") @Nullable Long practiceLocationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            LEFT JOIN PatientInvitationDetails pid ON pid.patient.id = pdo.patient.id
            LEFT JOIN Invitation i ON pid.invitation.id = i.id
            WHERE pdo.organization.id = :organizationId
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
            """)
    Long combinedActivePatientCountForOrg(
            @Param("organizationId") Long organizationId,
            @Param("practiceLocationId") @Nullable Long practiceLocationId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
    SELECT COUNT(DISTINCT o.patient.id)
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
    """)
    Long countPatientIdOfCustomerPatientForOrg(
            @Param("targetProfileId") Long targetProfileId,
            @Param("appInviteStatus") String appInviteStatus,
            @Param("search") String search,
            @Param("patientType") String patientType,
            @Param("roles") List<String> roles);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            WHERE pdo.organization.id = :organizationId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND YEAR(pdo.createdAt) = YEAR(CURRENT_DATE)
            AND MONTH(pdo.createdAt) = MONTH(CURRENT_DATE)
            """)
    Long newCasesThisMonthCount(@Param("organizationId") Long organizationId);

    @Query(
            """
            SELECT COUNT(DISTINCT pdo.patient.id)
            FROM PatientDoctorOrganization pdo
            WHERE pdo.doctor.id = :doctorId
            AND pdo.organization.id = :organizationId
            AND pdo.userProfile.id = :profileId
            AND pdo.patient.patientStatus != 'ARCHIVE'
            AND YEAR(pdo.createdAt) = YEAR(CURRENT_DATE)
            AND MONTH(pdo.createdAt) = MONTH(CURRENT_DATE)
            """)
    Long newCasesThisMonthCountForOrg(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);
}
