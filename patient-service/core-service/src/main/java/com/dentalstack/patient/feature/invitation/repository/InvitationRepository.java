package com.dentalstack.patient.feature.invitation.repository;

import static org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE;

import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.projection.InvitationStatusSummary;
import com.dentalstack.patient.feature.invitation.projection.InvitationSummary;
import com.dentalstack.patient.feature.invitation.projection.PatientInvitationStatusSummary;
import com.dentalstack.patient.feature.invitation.projection.WebLeadDetailsSummary;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.tracking.enums.Status;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.enums.ProductTypeName;
import feign.Param;
import jakarta.persistence.QueryHint;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.stereotype.Repository;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findByInviterIdAndInviterUserTypeAndInvitedUserType(
            long inviterId, UserType inviterUserType, UserType invitedUserType);

    List<Invitation> findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatus(
            long inviterId, UserType inviterUserType, UserType invitedUserType, InvitationStatus status);

    @Query(
            value =
                    "SELECT DISTINCT pid.email, i.* FROM invitation i INNER JOIN patient_invitation_details pid ON i.id = pid.invitation_id INNER JOIN patient p ON pid.patient_id = p.id WHERE i.inviter_id = ?1 AND i.inviter_user_type = ?2 AND i.invited_user_type = ?3 AND i.status = ?4 AND NOT EXISTS ( SELECT 1 FROM appointment a WHERE a.patient_id = p.id )",
            nativeQuery = true)
    List<Invitation> findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusAndAppointmentIsNull(
            long inviterId, int inviterUserType, int invitedUserType, int status);

    @Query(
            value =
                    "SELECT DISTINCT pid.email, i.* FROM invitation i INNER JOIN patient_invitation_details pid ON i.id = pid.invitation_id INNER JOIN patient p ON pid.patient_id = p.id WHERE i.inviter_id = ?1 AND i.inviter_user_type = ?2 AND i.invited_user_type = ?3 AND i.status = ?4 AND NOT EXISTS ( SELECT 1 FROM appointment a WHERE a.patient_id = p.id ) AND NOT EXISTS ( SELECT 1 FROM appointment_reminder ar inner join braces_journey bj on ar.braces_journey_id = bj.id where bj.patient_id = p.id );",
            nativeQuery = true)
    List<Invitation> findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusAndAppointmentIsNullAndReminderIsNull(
            long inviterId, int inviterUserType, int invitedUserType, int status);

    List<Invitation> findByInviterIdAndInviterUserTypeAndInvitedUserTypeAndStatusIn(
            long inviterId, UserType inviterUserType, UserType invitedUserType, List<InvitationStatus> status);

    @Query(
            """
    SELECT i
    FROM Invitation i
    LEFT JOIN i.patientInvitation pid
    LEFT JOIN pid.patient p
    LEFT JOIN p.doctorOrganization pdo
    LEFT JOIN pdo.doctor d
    LEFT JOIN pdo.organization o
    LEFT JOIN pdo.userProfile up
    WHERE i.inviterId = :inviterId
      AND i.inviterUserType = :inviterUserType
      AND i.invitedUserType = :invitedUserType
      AND i.status IN :status
""")
    List<Invitation> findInvitationsWithPatientDetails(
            @Param("inviterId") long inviterId,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("status") List<InvitationStatus> status);

    @Query("SELECT pid.patient.id " + "FROM Invitation i "
            + "JOIN i.patientInvitation pid "
            + "WHERE pid.patient.id IN :patientIds "
            + "AND i.inviterUserType = :inviterUserType "
            + "AND i.invitedUserType = :invitedUserType "
            + "AND i.status IN :statusList")
    Set<Long> findPatientIdsByPatientIdsAndStatus(
            @Param("patientIds") List<Long> patientIds,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("statusList") List<InvitationStatus> statusList);

    @Query("SELECT i.patientInvitation.patient.id AS patientId, i.status AS status "
            + "FROM Invitation i WHERE i.inviterId = :inviterId AND i.inviterUserType = :inviterUserType "
            + "AND i.invitedUserType = :invitedUserType AND i.status IN :statusList")
    List<InvitationSummary> findInvitationSummariesByCriteria(
            @Param("inviterId") long inviterId,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("statusList") List<InvitationStatus> statusList);

    @Query(
            """
SELECT DISTINCT i FROM Invitation i
JOIN FETCH i.patientInvitation pi
JOIN FETCH pi.patient p
JOIN FETCH i.invitationCode ic
LEFT JOIN TreatmentPlan tp ON tp.patient = p
LEFT JOIN tp.tracking t
LEFT JOIN AlignerJourney aj ON aj.patient = p
LEFT JOIN BracesJourney bj ON bj.patient = p
LEFT JOIN bj.appointments a
WHERE i.inviterId = :doctorId
AND i.inviterUserType = :doctorUserType
AND i.invitedUserType = :patientUserType
AND i.status IN :statusList
AND p.patientStatus != :archiveStatus
AND (
    (tp IS NULL OR t IS NULL OR (t.status = :draftStatus AND t.askPatientToFill = false))
    AND aj IS NULL
    AND (bj IS NULL OR a IS NULL)
)
AND (tp IS NULL OR tp.treatmentSubType IN :treatmentSubTypes)
""")
    List<Invitation> findWebLeadInvitations(
            @Param("doctorId") Long doctorId,
            @Param("doctorUserType") UserType doctorUserType,
            @Param("patientUserType") UserType patientUserType,
            @Param("statusList") List<InvitationStatus> statusList,
            @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes,
            @Param("archiveStatus") PatientStatus archiveStatus,
            @Param("draftStatus") Status draftStatus);

    @Query(
            """
SELECT
    DISTINCT i.id AS invitationId,
    i.status AS invitationStatus,
    i.isInvitationSent AS isInvitationSent,
    i.createdAt AS invitedAt,
    ic.code AS inviteCode,

    p.id AS patientId,
    p.firstName AS firstName,
    p.lastName AS lastName,
    p.practiceLocationName AS practiceLocationName,
    p.email AS email,
    p.mobileNo AS mobileNo,
    p.age AS age,
    p.gender AS gender,
    p.customerMappedId AS customerMappedId,
    p.productTypeNames AS productTypeNames,
    p.profilePictureUrl AS profilePictureUrl,
    p.UUID AS UUID,
    p.chiefComplaint AS chiefComplaint,
    p.countryCode AS countryCode,
    p.patientStatus AS patientStatus,
    p.addedByUserId AS addedByUserId,

    pdo.patientBelongsTo AS patientBelongsTo,
    pdo.isPracticeAssigned AS isPracticeAssigned,
    d.id AS practiceDoctorId,
    up.id AS practiceProfileId,
    abp.id AS addedByUserProfileId,
    o.id AS practiceOrganizationId,
    u.displayName AS practiceDisplayName,

    CASE
        WHEN EXISTS (
            SELECT 1 FROM TreatmentPlan tp2
            WHERE tp2.patient = p
            AND tp2.status = 'ACTIVE'
        ) THEN 'ADD_TRACKING'
        WHEN EXISTS (
            SELECT 1 FROM TreatmentPlan tp2
            WHERE tp2.patient = p
            AND tp2.status = 'DRAFT'
        ) THEN 'IN_PLANNING'
        WHEN EXISTS (
            SELECT 1 FROM BracesJourney bj2
            WHERE bj2.patient = p
            AND bj2.bracesTreatmentStage = 'ACTIVE'
        ) THEN 'ADD_TRACKING'
        WHEN EXISTS (
            SELECT 1 FROM BracesJourney bj2
            WHERE bj2.patient = p
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
FROM Invitation i
JOIN i.patientInvitation pi
JOIN pi.patient p
LEFT JOIN i.invitationCode ic
JOIN p.doctorOrganization pdo
JOIN pdo.userProfile up
JOIN pdo.addedByUserProfile abp
JOIN up.user u
JOIN pdo.doctor d
JOIN pdo.organization o
LEFT JOIN TreatmentPlan tp ON tp.patient = p
LEFT JOIN tp.tracking t
LEFT JOIN AlignerJourney aj ON aj.patient = p
LEFT JOIN BracesJourney bj ON bj.patient = p
LEFT JOIN bj.appointments a
WHERE p.id IN :patientIds
AND pdo.organization.id = :organizationId
AND i.inviterUserType = :doctorUserType
AND i.invitedUserType = :patientUserType
AND i.status IN :statusList
AND p.patientStatus != :archiveStatus
AND (
    (tp IS NULL OR t IS NULL OR (t.status = :draftStatus AND t.askPatientToFill = false))
    AND aj IS NULL
    AND (bj IS NULL OR a IS NULL)
)
AND (tp IS NULL OR tp.treatmentSubType IN :treatmentSubTypes)
""")
    List<WebLeadDetailsSummary> findWebLeadInvitationsByPatientIds(
            @Param("patientIds") List<Long> patientIds,
            @Param("organizationId") Long organizationId,
            @Param("doctorUserType") UserType doctorUserType,
            @Param("patientUserType") UserType patientUserType,
            @Param("statusList") List<InvitationStatus> statusList,
            @Param("treatmentSubTypes") List<ProductTypeName> treatmentSubTypes,
            @Param("archiveStatus") PatientStatus archiveStatus,
            @Param("draftStatus") Status draftStatus);

    @Query(
            """
    SELECT DISTINCT i FROM Invitation i
    JOIN FETCH i.patientInvitation pi
    JOIN FETCH pi.patient p
    JOIN FETCH i.invitationCode ic
    JOIN FETCH p.doctorOrganization pdo
    JOIN FETCH pdo.userProfile up
    JOIN FETCH up.user u
    WHERE p.id IN :patientIds
    AND i.inviterUserType = :inviterUserType
    AND i.invitedUserType = :invitedUserType
    AND i.status IN :status
    """)
    List<Invitation> findByPatientIdsAndStatusIn(
            @Param("patientIds") List<Long> patientIds,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("status") List<InvitationStatus> status);

    @Query(
            """
    SELECT CASE WHEN COUNT(i) > 0 THEN TRUE ELSE FALSE END
    FROM Invitation i
    JOIN i.patientInvitation pi
    JOIN pi.patient p
    WHERE p.id = :patientId
    AND i.inviterUserType = :inviterUserType
    AND i.invitedUserType = :invitedUserType
    AND i.isInvitationSent = TRUE
    AND i.status = :status
""")
    boolean isInvitationSentToPatient(
            @Param("patientId") Long patientId,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("status") InvitationStatus status);

    @Query(
            """
            SELECT
                i.status as status,
                i.isInvitationSent as isInvitationSent
            FROM Invitation i
            JOIN i.patientInvitation pi
            WHERE pi.patient.id = :patientId
            ORDER BY i.createdAt DESC
            """)
    @QueryHints(value = @QueryHint(name = HINT_FETCH_SIZE, value = "1"))
    Optional<InvitationStatusSummary> findLatestInvitationStatusByPatientId(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END
    FROM Invitation i
    JOIN i.patientInvitation pi
    WHERE pi.patient.id = :patientId
    AND i.isInvitationSent = true
    """)
    boolean hasAnyInvitationBeenSent(@Param("patientId") Long patientId);

    @Query(
            """
    SELECT CASE WHEN COUNT(i) > 0 THEN TRUE ELSE FALSE END
    FROM Invitation i
    JOIN i.patientInvitation pid
    WHERE i.inviterId = :inviterId
      AND i.inviterUserType = :inviterUserType
      AND i.invitedUserType = :invitedUserType
      AND (
          (:mobile IS NOT NULL AND pid.mobile = :mobile)
          OR (:email IS NOT NULL AND LOWER(pid.email) = LOWER(:email))
      )
    """)
    boolean existsByInviterAndMobileOrEmail(
            @Param("inviterId") long inviterId,
            @Param("inviterUserType") UserType inviterUserType,
            @Param("invitedUserType") UserType invitedUserType,
            @Param("mobile") String mobile,
            @Param("email") String email);

    @Query(
            value =
                    """
        SELECT DISTINCT pid.email, i.*
        FROM invitation i
        INNER JOIN patient_invitation_details pid ON i.id = pid.invitation_id
        INNER JOIN patient p ON pid.patient_id = p.id
        WHERE p.email = ?1
        """,
            nativeQuery = true)
    Invitation findByPatientEmailId(String email);

    @Query(
            """
    SELECT
        pi.patient.id as patientId,
        i.status as status,
        i.isInvitationSent as isInvitationSent
    FROM Invitation i
    JOIN i.patientInvitation pi
    WHERE pi.patient.id IN :patientIds
    AND i.id = (
        SELECT MAX(i2.id)
        FROM Invitation i2
        JOIN i2.patientInvitation pi2
        WHERE pi2.patient.id = pi.patient.id
    )
""")
    List<PatientInvitationStatusSummary> findLatestInvitationStatusByPatientIds(
            @Param("patientIds") Collection<Long> patientIds);
}
