package com.dentalstack.patient.feature.user.repository;

import com.dentalstack.patient.feature.doctor.enums.ProfileType;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.projection.UserProfileSummary;
import feign.Param;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH up.plan p "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH ip.doctor ipd "
            + "WHERE up.id = :profileId")
    Optional<UserProfile> findByIdWithOrgAndDoctor(@Param("profileId") Long profileId);

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH ip.doctorBilling idb "
            + "WHERE up.id = :profileId")
    Optional<UserProfile> findByIdWithOrgAndDoctorAndUser(@Param("profileId") Long profileId);

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH ip.doctorBilling idb "
            + "WHERE up.id IN :profileIds")
    List<UserProfile> findAllByIdWithOrgAndDoctorAndUser(@Param("profileIds") Collection<Long> profileIds);

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH ip.doctorBilling idb "
            + "LEFT JOIN FETCH ip.roles ipr "
            + "LEFT JOIN FETCH ip.organization ipo "
            + "LEFT JOIN FETCH ip.doctor idoc "
            + "WHERE up.id = :profileId")
    Optional<UserProfile> findByIdWithOrgAndDoctorAndUseWithInviterRoles(@Param("profileId") Long profileId);

    @Query("SELECT CASE WHEN (sr.name = 'ADMIN' AND sr.subRoleTag = 'DEFAULT') THEN true ELSE false END "
            + "FROM UserProfile up "
            + "LEFT JOIN up.subRole sr "
            + "WHERE up.id = :profileId")
    Boolean isAdminWithDefaultTag(@Param("profileId") Long profileId);

    @Query("SELECT u FROM UserProfile u LEFT JOIN FETCH u.roles WHERE u.id = :profileId")
    Optional<UserProfile> findByIdWithRoles(@Param("profileId") Long profileId);

    @Query(
            """
            SELECT
                up.id as profileId,
                u.firstName as firstName,
                u.lastName as lastName,
                u.email as email,
                u.mobileNo as mobileNo,
                u.displayName as displayName,
                u.countryCode as countryCode,
                u.salutation as salutation,
                u.displayProfileUrl as displayPicture,
                u.profileUrl as profilePicture,
                up.profileType as profileType,
                up.organizationBrandName as orgName,
                d.id as doctorId
            FROM UserProfile up
            LEFT JOIN up.user u
            LEFT JOIN up.doctor d
            WHERE up.id = :profileId
            """)
    Optional<UserProfileSummary> userProfileDetailsById(@Param("profileId") Long profileId);

    @Query(
            """
            SELECT
                up.id as profileId,
                up.organizationBrandName as orgName,
                u.firstName as firstName,
                u.lastName as lastName,
                u.email as email,
                u.mobileNo as mobileNo,
                d.id as doctorId,
                org.id as organizationId,
                u.displayName as displayName,
                u.countryCode as countryCode,
                u.salutation as salutation,
                u.displayProfileUrl as displayPicture,
                u.profileUrl as profilePicture,
                up.profileType as profileType,
                db.companyDisplayName as billingName
            FROM UserProfile up
            LEFT JOIN up.user u
            LEFT JOIN up.doctor d
            LEFT JOIN up.organization org
            LEFT JOIN up.doctorBilling db
            WHERE up.id IN (:profileIds)
            """)
    List<UserProfileSummary> findSummaryByIds(@Param("profileIds") List<Long> profileIds);

    @Query(
            """
    SELECT
        up.id as profileId,
        up.organizationBrandName as orgName,
        u.firstName as firstName,
        u.lastName as lastName,
        u.email as email,
        u.mobileNo as mobileNo,
        d.id as doctorId,
        org.id as organizationId,
        u.displayName as displayName,
        u.countryCode as countryCode,
        u.salutation as salutation,
        u.displayProfileUrl as displayPicture,
        u.profileUrl as profilePicture,
        up.profileType as profileType,
        db.companyDisplayName as billingName
    FROM UserProfile up
    LEFT JOIN up.user u
    LEFT JOIN up.doctor d
    LEFT JOIN up.organization org
    LEFT JOIN up.doctorBilling db
    LEFT JOIN up.roles r
    WHERE up.organization.id = :organisationId
    AND up.profileType = :profileType
    AND up.inviterProfile.id = :inviterId
    AND r.name = :roleName
    """)
    List<UserProfileSummary> findActiveInviterUsers(
            @Param("organisationId") Long organisationId,
            @Param("profileType") ProfileType profileType,
            @Param("inviterId") Long inviterId,
            @Param("roleName") String roleName);

    UserProfile findSingleByOrganizationIdAndProfileType(
            @Param("organisationId") Long organisationId, @Param("profileType") ProfileType profileType);

    List<UserProfile> findAllByOrganizationIdAndProfileTypeIn(
            @Param("organisationId") Long organisationId, @Param("profileTypes") List<ProfileType> profileTypes);

    @Query("SELECT DISTINCT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.roles r "
            + "WHERE up.organization.id = :organisationId "
            + "AND up.profileType IN :profileTypes")
    List<UserProfile> findAllByOrganizationIdAndProfileTypeInWithDoctorAndRoles(
            @Param("organisationId") Long organisationId, @Param("profileTypes") List<ProfileType> profileTypes);

    @Query("SELECT DISTINCT up FROM UserProfile up " + "JOIN FETCH up.user u "
            + "JOIN up.roles r "
            + "WHERE up.organization.id = :organisationId "
            + "AND up.profileType = :profileType "
            + "AND up.inviterProfile.id = :inviterId "
            + "AND r.name = :roleName")
    List<UserProfile> findAllProfilesByOrganizationIdAndProfileTypeAndInviterIdAndRoles(
            @Param("organisationId") Long organisationId,
            @Param("profileType") ProfileType profileType,
            @Param("inviterId") Long inviterId,
            @Param("roleName") String roleName);

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.roles r "
            + "WHERE doc.id = :doctorId AND org.id = :organizationId")
    Optional<UserProfile> findUserProfileIdByDoctorIdAndOrganizationId(
            @Param("doctorId") Long doctorId, @Param("organizationId") Long organizationId);

    @Query("SELECT up.id FROM UserProfile up "
            + "LEFT JOIN up.organization org "
            + "LEFT JOIN up.doctor doc "
            + "WHERE doc.id = :doctorId AND org.id = :organizationId")
    Optional<Long> findUserProfileIdByDoctorIdAndOrganizationIdForSearch(
            @Param("doctorId") Long doctorId, @Param("organizationId") Long organizationId);

    @Query("SELECT CASE WHEN COUNT(up) > 0 THEN true ELSE false END " + "FROM UserProfile up "
            + "WHERE up.id = :profileId AND up.doctor.id = :doctorId")
    boolean existsByIdAndDoctorId(@Param("profileId") Long profileId, @Param("doctorId") Long doctorId);

    @Query("SELECT DISTINCT up.id FROM UserProfile up WHERE up.doctor.id = :doctorId")
    List<Long> findProfileIdsByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT DISTINCT up.organization.id FROM UserProfile up WHERE up.id IN :profileIds")
    List<Long> findOrganizationIdsByProfileIds(@Param("profileIds") List<Long> profileIds);

    @Query("SELECT up FROM UserProfile up " + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH ip.roles ipr "
            + "LEFT JOIN FETCH ip.organization ipo "
            + "LEFT JOIN FETCH ip.doctor idoc "
            + "LEFT JOIN FETCH ip.doctorBilling idb "
            + "LEFT JOIN FETCH up.subRole sr "
            + "LEFT JOIN FETCH sr.clonedFrom "
            + "LEFT JOIN FETCH sr.modulePermissions mp "
            + "LEFT JOIN FETCH mp.module m "
            + "LEFT JOIN FETCH sr.subModulePermissions smp "
            + "LEFT JOIN FETCH smp.subModule sm "
            + "LEFT JOIN FETCH sm.module "
            + "LEFT JOIN FETCH sr.plan p "
            + "WHERE up.id = :profileId")
    Optional<UserProfile> findUserProfileWithPlanHierarchy(@Param("profileId") Long profileId);

    @Query("SELECT DISTINCT up FROM UserProfile up " + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.doctorBilling db "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH ip.roles ipr "
            + "LEFT JOIN FETCH ip.organization ipo "
            + "LEFT JOIN FETCH ip.doctor idoc "
            + "LEFT JOIN FETCH ip.doctorBilling idb "
            + "LEFT JOIN FETCH up.subRole sr "
            + "LEFT JOIN FETCH sr.clonedFrom "
            + "LEFT JOIN FETCH sr.modulePermissions mp "
            + "LEFT JOIN FETCH mp.module m "
            + "LEFT JOIN FETCH sr.subModulePermissions smp "
            + "LEFT JOIN FETCH smp.subModule sm "
            + "LEFT JOIN FETCH sm.module "
            + "LEFT JOIN FETCH sr.plan p "
            + "WHERE up.id IN :profileIds")
    List<UserProfile> findUserProfilesWithPlanHierarchy(@Param("profileIds") List<Long> profileIds);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " + "FROM UserProfile up JOIN up.roles r "
            + "WHERE up.id = :profileId AND r.name = :roleName")
    boolean isInternalUser(@Param("profileId") Long profileId, @Param("roleName") String roleName);

    @Query("SELECT up FROM UserProfile up " + "WHERE up.doctor.id = :doctorId "
            + "AND up.inviterProfile.id = :inviterProfileId")
    Optional<UserProfile> findUserProfileByDoctorIdAndInviterProfileId(
            @Param("doctorId") Long doctorId, @Param("inviterProfileId") Long inviterProfileId);

    @Query("SELECT up FROM UserProfile up " + "LEFT JOIN FETCH up.user u " + "WHERE up.doctor.id = :doctorId")
    List<UserProfile> findUserProfilesByDoctorId(@Param("doctorId") Long doctorId);

    @Query(
            value = "SELECT up.id FROM user_profile up " + "JOIN user_profile_role upr ON up.id = upr.user_profile_id "
                    + "JOIN role r ON upr.role_id = r.id "
                    + "WHERE up.profile_type = 'INVITED' "
                    + "AND r.name = 'INTERNAL_USER' "
                    + "AND up.inviter_profile_id = :inviterProfileId",
            nativeQuery = true)
    List<Long> findInvitedInternalUserProfileIdsByInviter(@Param("inviterProfileId") Long inviterProfileId);

    @Query(
            value = "SELECT up.doctor_id FROM user_profile up "
                    + "JOIN user_profile_role upr ON up.id = upr.user_profile_id "
                    + "JOIN role r ON upr.role_id = r.id "
                    + "WHERE up.profile_type = 'INVITED' "
                    + "AND r.name = 'INTERNAL_USER' "
                    + "AND up.inviter_profile_id = :inviterProfileId "
                    + "AND up.doctor_id IS NOT NULL",
            nativeQuery = true)
    List<Long> findInvitedInternalUserDoctorIdsByInviter(@Param("inviterProfileId") Long inviterProfileId);

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH up.doctor ipd "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH up.roles r "
            + "WHERE up.id = :profileId")
    Optional<UserProfile> findUserProfileDetails(@Param("profileId") Long profileId);

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.roles r "
            + "WHERE us.email = :email")
    List<UserProfile> findByEmail(@Param("email") String email);

    @Query(
            value =
                    """
            select mobile_no
     from
     (
         SELECT DISTINCT
             u.mobile_no
         FROM user_profile c
             JOIN user_profile o
                 ON o.id = CASE
                               WHEN c.profile_type = 'OWNER' THEN
                                   c.id
                               ELSE
                                   c.inviter_profile_id
                           END
             JOIN users u
                 ON u.id = o.id
         where c.id = 2445
         UNION
         SELECT DISTINCT
             u.mobile_no
         FROM user_profile c
             JOIN user_profile o
                 ON o.id = CASE
                               WHEN c.profile_type = 'OWNER' THEN
                                   c.id
                               ELSE
                                   c.inviter_profile_id
                           END
             JOIN user_profile a
                 ON a.inviter_profile_id = o.id
             JOIN sub_role sr
                 ON sr.id = a.sub_role_id
             JOIN users u
                 ON u.id = a.id
         WHERE c.id = 2445
               AND sr.name = 'ADMIN'
               AND sr.sub_role_tag = 'DEFAULT'
     ) as mobile_no
     WHERE  mobile_no IS NOT NULL
            AND mobile_no <> ''
        """,
            nativeQuery = true)
    List<String> findAdminAndOwnerMobilesByCustomer(@Param("customerProfileId") Long customerProfileId);

    @Query(
            value =
                    """
        SELECT DISTINCT u.mobile_no
        FROM user_profile a
        JOIN sub_role sr ON sr.id = a.sub_role_id
        JOIN users u ON u.id = a.id
        WHERE a.inviter_profile_id = :ownerProfileId
          AND sr.name = 'ADMIN'
          AND sr.sub_role_tag = 'DEFAULT' AND u.mobile_no IS NOT NULL
            AND u.mobile_no <> ''
        """,
            nativeQuery = true)
    List<String> findAdminMobilesByOwner(@Param("ownerProfileId") Long ownerProfileId);

    @Query(
            value =
                    """
        SELECT DISTINCT u.mobile_no
        FROM patient_doctor_organization pdo
        JOIN user_profile up ON up.id = pdo.user_profile_id
        JOIN users u ON u.id = up.id
        WHERE pdo.patient_id = :patientId
        AND u.mobile_no IS NOT NULL
        AND u.mobile_no <> ''
        """,
            nativeQuery = true)
    List<String> findCustomerMobileByPatient(@Param("patientId") Long patientId);

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH up.plan p "
            + "LEFT JOIN FETCH up.inviterProfile ip "
            + "LEFT JOIN FETCH ip.user ipu "
            + "LEFT JOIN FETCH ip.doctor ipd "
            + "WHERE up.doctor.id = :doctorId "
            + "ORDER BY up.createdAt DESC "
            + "LIMIT 1")
    Optional<UserProfile> findLatestByDoctorId(@Param("doctorId") Long doctorId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN sub_role sr ON sr.id = up.sub_role_id
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = up.id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        JOIN plan p
            ON p.id = up.plan_id
        WHERE sr.name = 'SUPER_ADMIN'
          AND sr.sub_role_tag = 'DEFAULT'
          AND up.id = :profileId
          AND s.is_whats_app_messaging_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isSuperAdmin(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN sub_role sr ON sr.id = up.sub_role_id
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = up.inviter_profile_id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        WHERE sr.name = 'ADMIN'
          AND sr.sub_role_tag = 'DEFAULT'
          AND up.id = :profileId
          AND up.profile_type = 'INVITED'
          AND s.is_whats_app_messaging_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isAdmin(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN sub_role sr
            ON sr.id = up.sub_role_id
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = up.inviter_profile_id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        WHERE sr.name = 'Customer (With Tracking)'
          AND sr.sub_role_tag = 'DEFAULT'
          AND up.id = :profileId
          AND up.profile_type = 'INVITED'
          AND s.is_whats_app_messaging_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isCustomer(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN sub_role sr
            ON sr.id = up.sub_role_id
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = up.inviter_profile_id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        WHERE sr.name = 'Planning'
          AND sr.sub_role_tag = 'DEFAULT'
          AND up.id = :profileId
          AND up.profile_type = 'INVITED'
          AND s.is_whats_app_messaging_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isPlanningUser(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN sub_role sr
            ON sr.id = up.sub_role_id
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = up.inviter_profile_id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        WHERE sr.name = 'Production'
          AND sr.sub_role_tag = 'DEFAULT'
          AND up.id = :profileId
          AND up.profile_type = 'INVITED'
          AND s.is_whats_app_messaging_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isProductionUser(Long profileId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN sub_role sr
            ON sr.id = up.sub_role_id
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id = up.inviter_profile_id
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        WHERE sr.name = 'Customer (With Tracking)'
          AND sr.sub_role_tag = 'DEFAULT'
          AND up.id = :profileId
          AND up.profile_type = 'INVITED'
          AND s.isgdrive_platform_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isGoogleDriveCustomer(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id =
                CASE
                    WHEN up.profile_type = 'OWNER'
                        THEN up.id
                    ELSE up.inviter_profile_id
                END
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        WHERE up.id = :profileId
          AND s.isgdrive_platform_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isGoogleDriveEnabled(@Param("profileId") Long profileId);

    @Query("""
    SELECT up.organizationBrandName
    FROM UserProfile up
    WHERE up.id = :profileId
""")
    Optional<String> findOrgName(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT EXISTS (
        SELECT 1
        FROM user_profile up
        JOIN subscription_user_mapping sum
            ON sum.user_profile_id =
                CASE
                    WHEN up.profile_type = 'OWNER'
                        THEN up.id
                    ELSE up.inviter_profile_id
                END
        JOIN subscription s
            ON s.id = sum.subscription_plan_id
        WHERE up.id = :profileId
          AND s.is_whats_app_messaging_enabled = TRUE
    )
    """,
            nativeQuery = true)
    boolean isWhatsAppEnabled(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
    SELECT u.email FROM user_profile up
    JOIN users u ON u.id = up.id
    JOIN sub_role sr ON sr.id = up.sub_role_id
    WHERE up.profile_type = 'INVITED'
    AND up.inviter_profile_id = :ownerProfileId
    AND sr.name = 'ADMIN'
    AND sr.sub_role_tag = 'DEFAULT'
    """,
            nativeQuery = true)
    List<String> findByOwnerProfileId(@Param("ownerProfileId") Long ownerProfileId);

    @Query(
            value =
                    """
    SELECT u.email FROM user_profile up
    JOIN users u ON u.id = up.id
    JOIN sub_role sr ON sr.id = up.sub_role_id
    WHERE up.profile_type = 'INVITED'
    AND up.id = :userProfileId
    AND sr.name = 'ADMIN'
    AND sr.sub_role_tag = 'DEFAULT'
    """,
            nativeQuery = true)
    List<String> findAdminEmails(@Param("userProfileId") Long userProfileId);

    @Query(
            value =
                    """
    SELECT u.display_name
    FROM user_profile up
    JOIN users u on u.id = up.user_id
    WHERE up.id = :profileId
    """,
            nativeQuery = true)
    String findDisplayName(@Param("profileId") Long profileId);

    @Query(
            value =
                    """
        SELECT owner.organization_brand_name
        FROM user_profile up
        JOIN user_profile owner
            ON owner.id =
                CASE
                    WHEN up.profile_type = 'OWNER'
                        THEN up.id
                    ELSE up.inviter_profile_id
                END
        WHERE up.id = :doctorId
        ORDER BY owner.id
        LIMIT 1
    """,
            nativeQuery = true)
    String findOrganizationBrandNameByDoctorId(@Param("doctorId") Long doctorId);

    @Query(
            value =
                    """
        SELECT EXISTS (
            SELECT 1
            FROM user_profile up
            JOIN sub_role sr
                ON sr.id = up.sub_role_id
            JOIN subscription_user_mapping sum
                ON sum.user_profile_id = up.inviter_profile_id
            JOIN subscription s
                ON s.id = sum.subscription_plan_id
            WHERE sr.name = 'Customer (With Tracking)'
              AND sr.sub_role_tag = 'DEFAULT'
              AND up.doctor_id = :doctorId
              AND up.profile_type = 'INVITED'
              AND s.is_whats_app_messaging_enabled = TRUE
        )
        """,
            nativeQuery = true)
    boolean isWhatsAppCustomerByDoctorId(@Param("doctorId") Long doctorId);

    @Query(
            value =
                    """
    SELECT up.id
    FROM user_profile up
    JOIN sub_role sr ON sr.id = up.sub_role_id
    JOIN subscription_user_mapping sum
        ON sum.user_profile_id = up.id
    JOIN subscription s
        ON s.id = sum.subscription_plan_id
    WHERE sr.name = 'SUPER_ADMIN'
      AND sr.sub_role_tag = 'DEFAULT'
      AND up.organization_id = :organizationId
      AND s.isgdrive_platform_enabled = TRUE
""",
            nativeQuery = true)
    Long findSuperAdminProfileId(Long organizationId);

    @Query(
            value = "SELECT up.id FROM user_profile up " + "JOIN user_profile_role upr ON up.id = upr.user_profile_id "
                    + "JOIN role r ON upr.role_id = r.id "
                    + "JOIN sub_role sr ON up.sub_role_id = sr.id "
                    + "WHERE r.name = 'INTERNAL_USER' "
                    + "AND sr.name = 'ADMIN' "
                    + "AND sr.sub_role_tag = 'DEFAULT' "
                    + "AND up.inviter_profile_id = :inviterProfileId",
            nativeQuery = true)
    List<Long> findAdminUserProfileIdsByInviter(@Param("inviterProfileId") Long inviterProfileId);
}
