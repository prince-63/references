package com.dentalstack.doctor.repository.invitation;

import com.dentalstack.doctor.entity.invitation.DoctorInvitation;
import com.dentalstack.doctor.enums.invitation.InvitationRole;
import com.dentalstack.doctor.enums.invitation.InvitationStatus;
import com.dentalstack.doctor.summary.DoctorInvitationSummary;
import com.dentalstack.doctor.summary.invitation.InvitationRoleCountSummary;
import com.dentalstack.doctor.summary.invitation.InvitationRolesCountSummary;
import feign.Param;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorInvitationRepository extends JpaRepository<DoctorInvitation, Long> {

    @Query(
            """
            SELECT di
            FROM DoctorInvitation di
            JOIN FETCH di.inviter d
            JOIN FETCH di.organization o
            LEFT JOIN FETCH di.assignedSubRole sr
            LEFT JOIN FETCH di.invitedDoctor id
            WHERE di.id = :invitationId
            """)
    Optional<DoctorInvitation> findByIdWithInviterAndOrganizationAndInvitedDoctor(
            @Param("invitationId") Long invitationId);

    Optional<DoctorInvitation> findFirstByEmailAndOrganizationIdAndInviterIdAndStatusOrderByInvitedAtDesc(
            String email, Long organizationId, Long inviterDoctorId, InvitationStatus invitationStatus);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    LEFT JOIN di.invitedDoctor d
    WHERE di.inviter.id = :doctorId
      AND di.organization.id = :organizationId
      AND di.roles = :role
    """)
    List<DoctorInvitation> findByDoctorIdAndOrganizationId(
            @Param("doctorId") long doctorId,
            @Param("organizationId") long organizationId,
            @Param("role") InvitationRole role);

    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.inviter.id = :doctorId
            AND di.organization.id = :organizationId
            AND di.roles IN :roles
            AND (
                LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            )
            """)
    List<DoctorInvitation> findBySearch(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.organization.id = :organizationId
            AND di.roles IN :roles
            AND (
                LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            )
            """)
    List<DoctorInvitation> findBySearchByOrg(
            @Param("organizationId") Long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            LEFT JOIN di.invitedDoctor d
            WHERE di.organization.id = :organizationId
            AND di.roles IN :roles
            """)
    List<DoctorInvitation> findByOrganizationId(
            @Param("organizationId") long organizationId, @Param("roles") List<InvitationRole> roles);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status = 'ACCEPTED') as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findInvitationCountsByOrganizationId(
            @Param("organizationId") long organizationId, @Param("roles") List<InvitationRole> roles);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status = 'ACCEPTED'
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findInvitationCountsBySearchByOrg(
            @Param("organizationId") Long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id IN :doctorIds
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status = 'ACCEPTED') as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id IN :doctorIds
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findReceivedInvitationCountsByDoctorIdsForOrg(
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id IN :doctorIds
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status = 'ACCEPTED'
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id IN :doctorIds
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findReceivedInvitationCountsBySearchForOrg(
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN di.invitedDoctor d
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.inviter.id = :doctorId
            AND di.organization.id = :organizationId
            AND di.roles IN :roles
            """)
    List<DoctorInvitation> findByDoctorIdAndOrganizationId(
            @Param("doctorId") long doctorId,
            @Param("organizationId") long organizationId,
            @Param("roles") List<InvitationRole> roles);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM DoctorInvitation i "
            + "WHERE i.organization.id = :organizationId "
            + "AND i.inviter.id = :inviterId "
            + "AND i.status != :status "
            + "AND i.email = :email "
            + "AND i.xOrganizationName = :xOrgName")
    boolean existsByOrganizationIdAndInviterIdAndStatusNotAndExpiresAtAfterAndEmail(
            @Param("organizationId") long organizationId,
            @Param("inviterId") Long inviterId,
            @Param("status") InvitationStatus status,
            @Param("email") String email,
            @Param("xOrgName") String xOrgName);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM DoctorInvitation i "
            + "WHERE i.organization.id = :organizationId "
            + "AND i.inviter.id = :inviterId "
            + "AND i.status != :status "
            + "AND i.mobileNo = :mobileNo")
    boolean existsByOrganizationIdAndInviterIdAndStatusNotAndExpiresAtAfterAndMobileNo(
            @Param("organizationId") long organizationId,
            @Param("inviterId") Long inviterId,
            @Param("status") InvitationStatus status,
            @Param("mobileNo") String mobileNo);

    @Query(
            """
    SELECT
        di.id as invitationId,
        di.firstName as firstName,
        di.lastName as lastName,
        di.email as email,
        di.mobileNo as mobileNo,
        di.salutation as salutation,
        di.countryCode as countryCode,
        di.registrationType as registrationType,
        di.invitationRole as invitationRole,
        dic.code as invitationCode,
        di.status as status,
        di.invitedAt as invitedAt,
        di.lastInvitationAt as lastInvitationAt,
        di.expiresAt as expiresAt,
        di.acceptedAt as acceptedAt,
        org.id as organizationId,
        org.name as organizationName,
        org.logo as organizationProfileUrl,
        inv.id as doctorId,
        inv.profileImage as profileUrl
    FROM DoctorInvitation di
    JOIN di.organization org
    JOIN di.inviter inv
    JOIN di.doctorInvitationCode dic
    WHERE di.id = :invitationId
""")
    Optional<DoctorInvitationSummary> findDoctorInvitationSummaryById(@Param("invitationId") Long invitationId);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    WHERE di.inviter.id = :doctorId
      AND di.organization.id = :organizationId
      AND di.roles = :role
      AND (
        LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
      )
    """)
    List<DoctorInvitation> findBySearch(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("role") InvitationRole role,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
    SELECT
        (SELECT COUNT(di2) FROM DoctorInvitation di2
         WHERE di2.inviter.id = :doctorId
         AND di2.organization.id = :organizationId
         AND di2.status = 'ACCEPTED'
         AND di2.roles IN :roles) as activeInvitationsCount,

        (SELECT COUNT(di3) FROM DoctorInvitation di3
         WHERE di3.inviter.id = :doctorId
         AND di3.organization.id = :organizationId
         AND di3.status IN ('PENDING', 'EXPIRED','REJECTED')
         AND di3.roles IN :roles) as pendingInvitationsCount

    FROM DoctorInvitation di
    WHERE di.inviter.id = :doctorId
    AND di.organization.id = :organizationId
    GROUP BY di.inviter.id, di.organization.id
    """)
    Optional<DoctorInvitationSummary> getActivePendingCount(
            @Param("doctorId") long doctorId,
            @Param("organizationId") long organizationId,
            @Param("roles") List<InvitationRole> roles);

    @Query(
            """
            SELECT
                (SELECT COUNT(di2) FROM DoctorInvitation di2
                 WHERE di2.organization.id = :organizationId
                 AND di2.status = 'ACCEPTED'
                 AND di2.roles IN :roles) as activeInvitationsCount,

                (SELECT COUNT(di3) FROM DoctorInvitation di3
                 WHERE di3.organization.id = :organizationId
                 AND di3.status IN ('PENDING', 'EXPIRED','REJECTED')
                 AND di3.roles IN :roles) as pendingInvitationsCount

            FROM DoctorInvitation di
            WHERE di.organization.id = :organizationId
            GROUP BY di.organization.id
            """)
    Optional<DoctorInvitationSummary> getActivePendingCountForInternalUser(
            @Param("organizationId") long organizationId, @Param("roles") List<InvitationRole> roles);

    @Query(
            """
    SELECT di
    FROM DoctorInvitation di
    LEFT JOIN FETCH di.organization o
    LEFT JOIN FETCH di.inviterUserProfile iup
    LEFT JOIN FETCH di.inviter d
    WHERE di.lastInvitationAt IS NULL
      AND di.status IN :statuses
      AND di.expiresAt > :currentTime
""")
    List<DoctorInvitation> findByLastInvitationAtIsNullAndStatusInAndExpiresAtAfter(
            @Param("statuses") Collection<InvitationStatus> statuses, @Param("currentTime") ZonedDateTime currentTime);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    WHERE di.inviter.id = :doctorId
      AND di.organization.id = :organizationId
      AND di.roles = :role
      AND (
        LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
      )
""")
    List<DoctorInvitation> findLabStaffBySearch(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("role") InvitationRole role,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    WHERE di.inviter.id = :doctorId
      AND di.organization.id = :organizationId
      AND di.roles IN (:role)
      AND (
        LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
      )
""")
    List<DoctorInvitation> findLabStaffAndInternalUserBySearch(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("role") List<InvitationRole> role,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    LEFT JOIN di.invitedDoctor d
    WHERE di.inviter.id = :doctorId
      AND di.organization.id = :organizationId
      AND di.roles = :role
""")
    List<DoctorInvitation> findAllLabStaff(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("role") InvitationRole role);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    LEFT JOIN di.invitedDoctor d
    WHERE di.inviter.id = :doctorId
      AND di.organization.id = :organizationId
      AND di.roles IN (:role)
""")
    List<DoctorInvitation> findAllLabStaffAndInternalUser(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("role") List<InvitationRole> role);

    @Query(
            nativeQuery = true,
            value =
                    """
    SELECT
        COUNT(CASE WHEN di.roles = 'CONSULTING_ORTHODONTIST' THEN 1 END) AS consultingOrthodontistCount,
        COUNT(CASE WHEN di.roles = 'CLINIC_OWNER' THEN 1 END) AS clinicOwnerCount,
        COUNT(CASE WHEN di.roles = 'IN_OFFICE_MANUFACTURER' THEN 1 END) AS inOfficeManufacturerCount,
        COUNT(CASE WHEN di.roles = 'ALIGNER_COMPANY_OR_LAB' THEN 1 END) AS alignerCompanyOrLabCount,
        COUNT(CASE WHEN di.roles = 'COMMERCIAL_ALIGNER_LAB' THEN 1 END) AS commercialAlignerLabCount,
        COUNT(CASE WHEN di.roles = 'LAB_STAFF' THEN 1 END) AS labStaffCount,
        COUNT(CASE WHEN di.roles = 'LAB_STAFF' AND COALESCE(di.status, '') IN ('PENDING', 'EXPIRED') THEN 1 END) AS invitedLabStaffCount,
        COUNT(CASE WHEN di.roles = 'LAB_STAFF' AND COALESCE(di.status, '') IN ('ACCEPTED', 'DEACTIVATED') THEN 1 END) AS activeLabStaffCount,
        COUNT(CASE WHEN di.roles = 'CUSTOMER' THEN 1 END) AS customerCount,
        COUNT(CASE WHEN di.roles = 'CUSTOMER' AND COALESCE(di.status, '') IN ('PENDING', 'EXPIRED') THEN 1 END) AS invitedCustomerCount,
        COUNT(CASE WHEN di.roles = 'CUSTOMER' AND COALESCE(di.status, '') IN ('ACCEPTED', 'DEACTIVATED') THEN 1 END) AS activeCustomerCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' THEN 1 END) AS vendorCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' AND COALESCE(di.status, '') IN ('PENDING', 'EXPIRED') THEN 1 END) AS invitedVendorCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' AND COALESCE(di.status, '') IN ('ACCEPTED', 'DEACTIVATED') THEN 1 END) AS activeVendorCount,
        CASE WHEN COUNT(CASE WHEN di.status = 'DEACTIVATED' THEN 1 END) > 0 THEN true ELSE false END AS isDeactivated
    FROM doctor_invitation di
    WHERE di.organization_id = :organizationId
    AND di.inviter_id = :doctorId
    """)
    InvitationRoleCountSummary findInvitationCountsByRole(
            @Param("organizationId") Long organizationId, @Param("doctorId") Long doctorId);

    @Query(
            nativeQuery = true,
            value =
                    """
    SELECT
        COUNT(CASE WHEN di.roles = 'VENDOR' THEN 1 END) AS customerCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' AND COALESCE(di.status, '') IN ('PENDING', 'EXPIRED') THEN 1 END) AS invitedCustomerCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' AND COALESCE(di.status, '') IN ('ACCEPTED', 'DEACTIVATED') THEN 1 END) AS activeCustomerCount
    FROM doctor_invitation di
    WHERE di.invited_doctor_id = :doctorId
    """)
    InvitationRoleCountSummary receivedInvitationCounts(@Param("doctorId") Long doctorId);

    @Query(
            nativeQuery = true,
            value =
                    """
    SELECT
        COUNT(CASE WHEN di.roles = 'CONSULTING_ORTHODONTIST' THEN 1 END) AS consultingOrthodontistCount,
        COUNT(CASE WHEN di.roles = 'CLINIC_OWNER' THEN 1 END) AS clinicOwnerCount,
        COUNT(CASE WHEN di.roles = 'IN_OFFICE_MANUFACTURER' THEN 1 END) AS inOfficeManufacturerCount,
        COUNT(CASE WHEN di.roles = 'ALIGNER_COMPANY_OR_LAB' THEN 1 END) AS alignerCompanyOrLabCount,
        COUNT(CASE WHEN di.roles = 'COMMERCIAL_ALIGNER_LAB' THEN 1 END) AS commercialAlignerLabCount,
        COUNT(CASE WHEN di.roles = 'LAB_STAFF' THEN 1 END) AS labStaffCount,
        COUNT(CASE WHEN di.roles = 'LAB_STAFF' AND COALESCE(di.status, '') IN ('PENDING', 'EXPIRED') THEN 1 END) AS invitedLabStaffCount,
        COUNT(CASE WHEN di.roles = 'LAB_STAFF' AND COALESCE(di.status, '') IN ('ACCEPTED', 'DEACTIVATED') THEN 1 END) AS activeLabStaffCount,
        COUNT(CASE WHEN di.roles = 'CUSTOMER' THEN 1 END) AS customerCount,
        COUNT(CASE WHEN di.roles = 'CUSTOMER' AND COALESCE(di.status, '') IN ('PENDING', 'EXPIRED') THEN 1 END) AS invitedCustomerCount,
        COUNT(CASE WHEN di.roles = 'CUSTOMER' AND COALESCE(di.status, '') IN ('ACCEPTED', 'DEACTIVATED') THEN 1 END) AS activeCustomerCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' THEN 1 END) AS vendorCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' AND COALESCE(di.status, '') IN ('PENDING', 'EXPIRED') THEN 1 END) AS invitedVendorCount,
        COUNT(CASE WHEN di.roles = 'VENDOR' AND COALESCE(di.status, '') IN ('ACCEPTED', 'DEACTIVATED') THEN 1 END) AS activeVendorCount,
        CASE WHEN COUNT(CASE WHEN di.status = 'DEACTIVATED' THEN 1 END) > 0 THEN true ELSE false END AS isDeactivated
    FROM doctor_invitation di
    WHERE di.organization_id = :organizationId
    AND di.invited_doctor_id = :doctorId
    """)
    InvitationRoleCountSummary findInvitationCounts(
            @Param("organizationId") Long organizationId, @Param("doctorId") Long doctorId);

    @Query(
            nativeQuery = true,
            value =
                    """
    SELECT
      di.status AS status
    FROM doctor_invitation di
    WHERE di.organization_id = :organizationId
    AND di.invited_doctor_id = :doctorId
    """)
    Optional<InvitationRoleCountSummary> findInvitationStatus(
            @Param("organizationId") Long organizationId, @Param("doctorId") Long doctorId);

    @Query(
            """
            SELECT
                (SELECT COUNT(di2) FROM DoctorInvitation di2
                 WHERE di2.invitedDoctor.id = :doctorId
                 AND di2.status = 'ACCEPTED'
                 AND di2.roles IN :roles
                 AND di2.inviterRole IN :inviterRoles) as activeInvitationsCount,

                (SELECT COUNT(di3) FROM DoctorInvitation di3
                 WHERE di3.invitedDoctor.id = :doctorId
                 AND di3.status IN ('PENDING', 'EXPIRED', 'REJECTED')
                 AND di3.roles IN :roles
                 AND di3.inviterRole IN :inviterRoles) as pendingInvitationsCount

            FROM DoctorInvitation di
            WHERE di.invitedDoctor.id = :doctorId
            GROUP BY di.invitedDoctor.id
            """)
    Optional<DoctorInvitationSummary> getReceivedActivePendingCount(
            @Param("doctorId") long doctorId,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles);

    @Query(
            """
    SELECT
        COALESCE(SUM(CASE WHEN di.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as activeInvitationsCount,
        COALESCE(SUM(CASE WHEN di.status = 'PENDING' THEN 1 ELSE 0 END), 0) as pendingInvitationsCount
    FROM DoctorInvitation di
    WHERE di.invitedDoctor.id IN :doctorIds
      AND di.roles IN :roles
      AND di.inviterRole IN :inviterRoles
""")
    DoctorInvitationSummary findInvitationSummaryByDoctorIdsForOrg(
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles);

    @Query(
            """
    SELECT
        (SELECT COUNT(di2) FROM DoctorInvitation di2
         WHERE di2.invitedDoctor.id = :doctorId
         AND di2.status = 'ACCEPTED'
         AND di2.roles IN :roles) as activeInvitationsCount,

        (SELECT COUNT(di3) FROM DoctorInvitation di3
         WHERE di3.invitedDoctor.id = :doctorId
         AND di3.status IN ('PENDING', 'EXPIRED', 'REJECTED')
         AND di3.roles IN :roles) as pendingInvitationsCount

    FROM DoctorInvitation di
    WHERE di.invitedDoctor.id = :doctorId
    GROUP BY di.invitedDoctor.id
    """)
    Optional<DoctorInvitationSummary> getReceivedActivePendingCount(
            @Param("doctorId") long doctorId, @Param("roles") List<InvitationRole> roles);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    LEFT JOIN FETCH di.assignedSubRole sr
    WHERE di.invitedDoctor.id = :doctorId
      AND di.roles IN :roles
      AND di.inviterRole IN :inviterRoles
      AND (
        LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
      )
    """)
    List<DoctorInvitation> findReceivedBySearch(
            @Param("doctorId") Long doctorId,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
            SELECT di FROM DoctorInvitation di
            WHERE di.invitedDoctor.id IN :doctorIds
              AND di.roles IN :roles
              AND di.inviterRole IN :inviterRoles
              AND (
                LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
              )
            """)
    List<DoctorInvitation> findReceivedBySearchForOrg(
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
    SELECT di FROM DoctorInvitation di
    LEFT JOIN FETCH di.assignedSubRole sr
    WHERE di.invitedDoctor.id = :doctorId
      AND di.roles IN :roles
      AND di.inviterRole IN :inviterRoles
    """)
    List<DoctorInvitation> findReceivedByDoctorId(
            @Param("doctorId") long doctorId,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.inviter.id = :doctorId
         AND di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status = 'ACCEPTED') as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.inviter.id = :doctorId
         AND di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findInvitationCountsByDoctorIdAndOrganizationId(
            @Param("doctorId") long doctorId,
            @Param("organizationId") long organizationId,
            @Param("roles") List<InvitationRole> roles);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.inviter.id = :doctorId
         AND di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status = 'ACCEPTED'
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.inviter.id = :doctorId
         AND di.organization.id = :organizationId
         AND di.roles IN :roles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findInvitationCountsBySearch(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id = :doctorId
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status = 'ACCEPTED') as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id = :doctorId
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findReceivedInvitationCountsByDoctorId(
            @Param("doctorId") long doctorId,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles);

    @Query(
            """
    SELECT
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id = :doctorId
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status = 'ACCEPTED'
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as activeInvitationsCount,
        (SELECT COUNT(di) FROM DoctorInvitation di
         WHERE di.invitedDoctor.id = :doctorId
         AND di.roles IN :roles
         AND di.inviterRole IN :inviterRoles
         AND di.status IN ('PENDING', 'EXPIRED', 'REJECTED')
         AND (
            LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
         )) as pendingInvitationsCount
    """)
    DoctorInvitationSummary findReceivedInvitationCountsBySearch(
            @Param("doctorId") Long doctorId,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("searchTerm") String searchTerm);

    @Query(
            """
            SELECT di FROM DoctorInvitation di
            WHERE di.invitedDoctor.id IN :doctorIds
              AND di.roles IN :roles
              AND di.inviterRole IN :inviterRoles
            """)
    List<DoctorInvitation> findReceivedByDoctorIdsForOrg(
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles);

    @Query("SELECT d.id FROM Doctor d JOIN d.organizations o WHERE o.id = :organizationId")
    List<Long> findDoctorIdsByOrganization(@Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT
        'SENT' as direction,
        di.inviterRole as senderRole,
        di.roles as receiverRole,
        SUM(CASE WHEN di.status = 'ACCEPTED' THEN 1 ELSE 0 END) as activeCount,
        SUM(CASE WHEN di.status IN ('PENDING', 'EXPIRED', 'REJECTED') THEN 1 ELSE 0 END) as pendingCount
    FROM DoctorInvitation di
    WHERE di.inviter.id = :doctorId
    AND di.organization.id = :organizationId
    GROUP BY di.inviterRole, di.roles
    """)
    List<InvitationRolesCountSummary> findSentInvitationCountsByRoles(
            @Param("doctorId") Long doctorId, @Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT
        'RECEIVED' as direction,
        di.inviterRole as senderRole,
        di.roles as receiverRole,
        SUM(CASE WHEN di.status = 'ACCEPTED' THEN 1 ELSE 0 END) as activeCount,
        SUM(CASE WHEN di.status IN ('PENDING', 'EXPIRED', 'REJECTED') THEN 1 ELSE 0 END) as pendingCount
    FROM DoctorInvitation di
    WHERE di.invitedDoctor.id = :doctorId
    GROUP BY di.inviterRole, di.roles
    """)
    List<InvitationRolesCountSummary> findReceivedInvitationCountsByRoles(@Param("doctorId") Long doctorId);

    @Query(
            value =
                    """
    SELECT
        'SENT' as direction,
        di.inviter_role as senderRole,
        di.roles as receiverRole,
        SUM(CASE WHEN di.status = 'ACCEPTED' THEN 1 ELSE 0 END) as activeCount,
        SUM(CASE WHEN di.status IN ('PENDING', 'EXPIRED', 'REJECTED') THEN 1 ELSE 0 END) as pendingCount
    FROM doctor_invitation di
    WHERE di.inviter_id = :doctorId
    AND di.organization_id = :organizationId
    GROUP BY di.inviter_role, di.roles

    UNION ALL

    SELECT
        'RECEIVED' as direction,
        di.inviter_role as senderRole,
        di.roles as receiverRole,
        SUM(CASE WHEN di.status = 'ACCEPTED' THEN 1 ELSE 0 END) as activeCount,
        SUM(CASE WHEN di.status IN ('PENDING', 'EXPIRED', 'REJECTED') THEN 1 ELSE 0 END) as pendingCount
    FROM doctor_invitation di
    WHERE di.invited_doctor_id = :doctorId
    GROUP BY di.inviter_role, di.roles
    """,
            nativeQuery = true)
    List<InvitationRolesCountSummary> findAllInvitationCountsByRoles(
            @Param("doctorId") Long doctorId, @Param("organizationId") Long organizationId);

    // ── Status-filtered query methods (P-3 fix) ──
    // These push the invitation-status filter into SQL so the DB returns only matching rows,
    // eliminating the previous pattern of fetching ALL invitations and filtering in Java.

    /** Org-level sent invitations — with search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.organization.id = :organizationId
            AND di.roles IN :roles
            AND di.status IN :statuses
            AND (
                LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            )
            """)
    List<DoctorInvitation> findBySearchByOrgAndStatuses(
            @Param("organizationId") Long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("searchTerm") String searchTerm,
            @Param("statuses") List<InvitationStatus> statuses);

    /** Org-level sent invitations — no search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            LEFT JOIN di.invitedDoctor d
            WHERE di.organization.id = :organizationId
            AND di.roles IN :roles
            AND di.status IN :statuses
            """)
    List<DoctorInvitation> findByOrganizationIdAndStatuses(
            @Param("organizationId") long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("statuses") List<InvitationStatus> statuses);

    /** Doctor-level sent invitations — with search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.inviter.id = :doctorId
            AND di.organization.id = :organizationId
            AND di.roles IN :roles
            AND di.status IN :statuses
            AND (
                LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            )
            """)
    List<DoctorInvitation> findBySearchAndStatuses(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("searchTerm") String searchTerm,
            @Param("statuses") List<InvitationStatus> statuses);

    /** Doctor-level sent invitations — no search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN di.invitedDoctor d
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.inviter.id = :doctorId
            AND di.organization.id = :organizationId
            AND di.roles IN :roles
            AND di.status IN :statuses
            """)
    List<DoctorInvitation> findByDoctorIdAndOrganizationIdAndStatuses(
            @Param("doctorId") long doctorId,
            @Param("organizationId") long organizationId,
            @Param("roles") List<InvitationRole> roles,
            @Param("statuses") List<InvitationStatus> statuses);

    /** Org-level received invitations — with search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            WHERE di.invitedDoctor.id IN :doctorIds
              AND di.roles IN :roles
              AND di.inviterRole IN :inviterRoles
              AND di.status IN :statuses
              AND (
                LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
              )
            """)
    List<DoctorInvitation> findReceivedBySearchForOrgAndStatuses(
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("searchTerm") String searchTerm,
            @Param("statuses") List<InvitationStatus> statuses);

    /** Org-level received invitations — no search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            WHERE di.invitedDoctor.id IN :doctorIds
              AND di.roles IN :roles
              AND di.inviterRole IN :inviterRoles
              AND di.status IN :statuses
            """)
    List<DoctorInvitation> findReceivedByDoctorIdsForOrgAndStatuses(
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("statuses") List<InvitationStatus> statuses);

    /** Doctor-level received invitations — with search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.invitedDoctor.id = :doctorId
              AND di.roles IN :roles
              AND di.inviterRole IN :inviterRoles
              AND di.status IN :statuses
              AND (
                LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.countryCode, di.mobileNo)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
              )
            """)
    List<DoctorInvitation> findReceivedBySearchAndStatuses(
            @Param("doctorId") Long doctorId,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("searchTerm") String searchTerm,
            @Param("statuses") List<InvitationStatus> statuses);

    /** Doctor-level received invitations — no search + status filter */
    @Query(
            """
            SELECT di FROM DoctorInvitation di
            LEFT JOIN FETCH di.assignedSubRole sr
            WHERE di.invitedDoctor.id = :doctorId
              AND di.roles IN :roles
              AND di.inviterRole IN :inviterRoles
              AND di.status IN :statuses
            """)
    List<DoctorInvitation> findReceivedByDoctorIdAndStatuses(
            @Param("doctorId") long doctorId,
            @Param("roles") List<InvitationRole> roles,
            @Param("inviterRoles") List<InvitationRole> inviterRoles,
            @Param("statuses") List<InvitationStatus> statuses);
}
