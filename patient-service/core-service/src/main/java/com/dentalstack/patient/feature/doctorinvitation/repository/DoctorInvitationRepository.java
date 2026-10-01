package com.dentalstack.patient.feature.doctorinvitation.repository;

import com.dentalstack.patient.feature.doctorinvitation.entity.DoctorInvitation;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.doctorinvitation.summary.DoctorInvitationSearchProjection;
import com.dentalstack.patient.feature.invitation.projection.InvitationCountsProjection;
import com.dentalstack.patient.feature.rbac.projection.InvitationSummaryProjection;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorInvitationRepository extends JpaRepository<DoctorInvitation, Long> {

    @Query(
            """
    SELECT
        SUM(CASE WHEN di.inviter.id = :doctorId
                 AND di.organization.id = :organizationId
                 AND di.roles IN :practiceRoles
                 THEN 1 ELSE 0 END) as practiceCount,
        SUM(CASE WHEN di.inviter.id = :doctorId
                 AND di.organization.id = :organizationId
                 AND di.roles IN :practiceRoles
                 AND di.status = 'ACCEPTED'
                 THEN 1 ELSE 0 END) as activePracticeCount,
        SUM(CASE WHEN di.inviter.id = :doctorId
                 AND di.organization.id = :organizationId
                 AND di.roles IN :customerRoles
                 AND di.status = 'ACCEPTED'
                 THEN 1 ELSE 0 END) as activeCustomerCount,
        SUM(CASE WHEN di.invitedDoctor.id = :doctorId
                 AND di.roles IN :customerRoles
                 AND di.inviterRole IN :labRoles
                 THEN 1 ELSE 0 END) as labSentCount,
        SUM(CASE WHEN di.inviter.id = :doctorId
                 AND di.organization.id = :organizationId
                 AND di.roles IN :vendorRoles
                 THEN 1 ELSE 0 END) as labReceivedCount,
        SUM(CASE WHEN di.invitedDoctor.id = :doctorId
                 AND di.roles IN :customerRoles
                 AND di.inviterRole IN :labRoles
                 AND di.status = 'ACCEPTED'
                 THEN 1 ELSE 0 END) as labSentAcceptedCount,
        SUM(CASE WHEN di.inviter.id = :doctorId
                 AND di.organization.id = :organizationId
                 AND di.roles IN :vendorRoles
                 AND di.status = 'ACCEPTED'
                 THEN 1 ELSE 0 END) as labReceivedAcceptedCount
    FROM DoctorInvitation di
    WHERE (di.inviter.id = :doctorId AND di.organization.id = :organizationId AND
           (di.roles IN :practiceRoles OR di.roles IN :vendorRoles OR di.roles IN :customerRoles))
       OR (di.invitedDoctor.id = :doctorId AND di.roles IN :customerRoles AND di.inviterRole IN :labRoles)
    """)
    InvitationCountsProjection countAllInvitations(
            @Param("doctorId") long doctorId,
            @Param("organizationId") long organizationId,
            @Param("practiceRoles") List<InvitationRole> practiceRoles,
            @Param("customerRoles") List<InvitationRole> customerRoles,
            @Param("labRoles") List<InvitationRole> labRoles,
            @Param("vendorRoles") List<InvitationRole> vendorRoles);

    @Query(
            """
            SELECT di
            FROM DoctorInvitation di
            JOIN FETCH di.inviter d
            JOIN FETCH di.organization o
            LEFT JOIN FETCH di.invitedDoctor id
            LEFT JOIN FETCH di.inviterUserProfile iup
            LEFT JOIN FETCH iup.user iupUser
            LEFT JOIN FETCH iup.doctorBilling db
            WHERE di.id = :invitationId
            """)
    Optional<DoctorInvitation> findByIdWithInviterAndOrganizationAndInvitedDoctor(
            @Param("invitationId") Long invitationId);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM DoctorInvitation i "
            + "WHERE i.organization.id = :organizationId "
            + "AND i.inviter.id = :inviterId "
            + "AND i.status != :status "
            + "AND i.email = :email")
    boolean existsByOrganizationIdAndInviterIdAndStatusNotAndExpiresAtAfterAndEmail(
            @Param("organizationId") long organizationId,
            @Param("inviterId") Long inviterId,
            @Param("status") InvitationStatus status,
            @Param("email") String email);

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
            value =
                    """
    SELECT COUNT(*)
    FROM doctor_invitation di
    LEFT JOIN user_profile up ON up.id = di.inviter_user_profile_id
    LEFT JOIN sub_role sr ON sr.id = di.assigned_sub_role_id
    WHERE di.inviter_user_profile_id = :inviterUserProfileId
        AND (:subRoleId IS NULL OR di.assigned_sub_role_id = :subRoleId)
        AND (di.roles = 'INTERNAL_USER')
        AND (:searchTerm IS NULL OR :searchTerm = '' OR (
            LOWER(di.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.country_code, di.mobile_no)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(CONCAT(di.first_name, ' ', di.last_name)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        ))
    """,
            nativeQuery = true)
    Long countInvitationSummaries(
            @Param("inviterUserProfileId") Long inviterUserProfileId,
            @Param("subRoleId") Long subRoleId,
            @Param("searchTerm") String searchTerm);

    @Query(
            value =
                    """
        SELECT
            di.first_name as firstName,
            di.last_name as lastName,
            u.profile_image_id as profileImageId,
            u.profile_url as profileImageUrl,
            di.email as email,
            di.mobile_no as mobileNumber,
            di.salutation as salutation,
            di.id as invitationId,
            sr.name as subRoleName,
            sr.id as subRoleId,
            di.status as invitationStatus,
            di.country_code as countryCode,
            dic.code as inviteCode,
            di.inviter_user_profile_id as inviterUserProfileId,
            di.invited_doctor_id as invitedDoctorId
        FROM doctor_invitation di
        LEFT JOIN user_profile up ON up.id = di.inviter_user_profile_id
        LEFT JOIN doctor d ON d.id = di.invited_doctor_id
        LEFT JOIN user_profile dup ON dup.id = d.primary_user_profile_id
        LEFT JOIN users u ON u.id = dup.user_id
        LEFT JOIN sub_role sr ON sr.id = di.assigned_sub_role_id
        LEFT JOIN doctor_invitation_code dic ON dic.doctor_invitation_id = di.id
        WHERE di.inviter_user_profile_id = :inviterUserProfileId
            AND (:subRoleId IS NULL OR di.assigned_sub_role_id = :subRoleId)
            AND (:invitationStatus IS NULL OR :invitationStatus = 'ALL' OR di.status = :invitationStatus)
            AND (di.roles = 'INTERNAL_USER')
            AND (:searchTerm IS NULL OR :searchTerm = '' OR (
                LOWER(di.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.country_code, di.mobile_no)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.first_name, ' ', di.last_name)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            ))
        ORDER BY di.updated_at DESC
        LIMIT :limit OFFSET :offset
        """,
            nativeQuery = true)
    List<InvitationSummaryProjection> getInvitationSummariesWithOffset(
            @Param("inviterUserProfileId") Long inviterUserProfileId,
            @Param("subRoleId") Long subRoleId,
            @Param("searchTerm") String searchTerm,
            @Param("invitationStatus") String invitationStatus,
            @Param("offset") int offset,
            @Param("limit") int limit);

    @Query(
            value =
                    """
        SELECT
            di.first_name as firstName,
            di.last_name as lastName,
            di.email as email,
            di.mobile_no as mobileNumber,
            di.salutation as salutation,
            di.id as invitationId,
            sr.name as subRoleName,
            sr.id as subRoleId,
            di.status as invitationStatus,
            di.country_code as countryCode,
            dic.code as inviteCode,
            di.inviter_user_profile_id as inviterUserProfileId,
            di.invited_doctor_id as invitedDoctorId
        FROM doctor_invitation di
        LEFT JOIN user_profile up ON up.id = di.inviter_user_profile_id
        LEFT JOIN sub_role sr ON sr.id = di.assigned_sub_role_id
        LEFT JOIN doctor_invitation_code dic ON dic.doctor_invitation_id = di.id
        WHERE di.inviter_user_profile_id = :inviterUserProfileId
            AND (:subRoleId IS NULL OR di.assigned_sub_role_id = :subRoleId)
            AND (:invitationStatus IS NULL OR :invitationStatus = 'ALL' OR di.status = :invitationStatus)
            AND (di.roles = 'INTERNAL_USER')
            AND (:searchTerm IS NULL OR :searchTerm = '' OR (
                LOWER(di.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.country_code, di.mobile_no)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.first_name, ' ', di.last_name)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            ))
        ORDER BY di.updated_at DESC
        LIMIT :pageSize OFFSET (:pageNumber * :pageSize)
        """,
            nativeQuery = true)
    List<InvitationSummaryProjection> getInvitationSummaries(
            @Param("inviterUserProfileId") Long inviterUserProfileId,
            @Param("subRoleId") Long subRoleId,
            @Param("searchTerm") String searchTerm,
            @Param("invitationStatus") String invitationStatus,
            @Param("pageNumber") int pageNumber,
            @Param("pageSize") int pageSize);

    @Query(
            value =
                    """
        SELECT
            di.first_name as firstName,
            di.last_name as lastName,
            u.profile_image_id as profileImageId,
            u.profile_url as profileImageUrl,
            di.email as email,
            di.mobile_no as mobileNumber,
            di.salutation as salutation,
            di.id as invitationId,
            sr.name as subRoleName,
            sr.id as subRoleId,
            di.status as invitationStatus,
            di.country_code as countryCode,
            dic.code as inviteCode,
            di.inviter_user_profile_id as inviterUserProfileId,
            di.invited_doctor_id as invitedDoctorId
        FROM doctor_invitation di
        LEFT JOIN user_profile up ON up.id = di.inviter_user_profile_id
        LEFT JOIN doctor d ON d.id = di.invited_doctor_id
        LEFT JOIN user_profile dup ON dup.id = d.primary_user_profile_id
        LEFT JOIN users u ON u.id = dup.user_id
        LEFT JOIN sub_role sr ON sr.id = di.assigned_sub_role_id
        LEFT JOIN doctor_invitation_code dic ON dic.doctor_invitation_id = di.id
        WHERE di.inviter_user_profile_id = :inviterUserProfileId
            AND (:subRoleId IS NULL OR di.assigned_sub_role_id = :subRoleId)
            AND (:invitationStatus IS NULL OR :invitationStatus = 'ALL' OR di.status = :invitationStatus)
            AND (di.roles = 'INTERNAL_USER')
            AND (:searchTerm IS NULL OR :searchTerm = '' OR (
                LOWER(di.first_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.last_name) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.country_code, di.mobile_no)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
                OR LOWER(CONCAT(di.first_name, ' ', di.last_name)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            ))
        ORDER BY di.updated_at DESC
        """,
            nativeQuery = true)
    List<InvitationSummaryProjection> getInvitationSummariesWithoutPagination(
            @Param("inviterUserProfileId") Long inviterUserProfileId,
            @Param("subRoleId") Long subRoleId,
            @Param("searchTerm") String searchTerm,
            @Param("invitationStatus") String invitationStatus);

    @Query(
            """
    SELECT
        di.id as id,
        di.firstName as firstName,
        di.lastName as lastName,
        di.email as email,
        di.roles as roles,
        di.status as status,
        CASE
            WHEN di.inviterUserProfile.id = :userProfileId THEN 'SENT'
            ELSE 'RECEIVED'
        END as invitationType
    FROM DoctorInvitation di
    WHERE di.organization.id = :organizationId
    AND di.status = 'ACCEPTED'
    AND (di.inviterUserProfile.id = :userProfileId OR di.invitedDoctor.id = :doctorId)
    AND (
        LOWER(di.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(di.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(CONCAT(di.firstName, ' ', di.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
    )
""")
    List<DoctorInvitationSearchProjection> searchAcceptedInvitations(
            @Param("userProfileId") Long userProfileId,
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("searchTerm") String searchTerm);
}
