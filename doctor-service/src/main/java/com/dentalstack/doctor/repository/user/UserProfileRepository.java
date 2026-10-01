package com.dentalstack.doctor.repository.user;

import com.dentalstack.doctor.entity.user.UserProfile;
import com.dentalstack.doctor.summary.DoctorBillingSummary;
import com.dentalstack.doctor.summary.UserProfileSummary;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    @Query("SELECT up FROM UserProfile up "
            + "LEFT JOIN FETCH up.organization org "
            + "LEFT JOIN FETCH up.doctor doc "
            + "LEFT JOIN FETCH up.user us "
            + "LEFT JOIN FETCH up.roles r "
            + "LEFT JOIN FETCH up.inviterProfile inup "
            + "LEFT JOIN FETCH inup.user inu "
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
            + "WHERE up.id = :profileId")
    Optional<UserProfile> findByIdWithOrgAndDoctorAndUser(@Param("profileId") Long profileId);

    @Query(
            """
        SELECT
            up.id as profileId,
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
            u.displayProfileImage.id as displayPictureId,
            u.profileImage.id as profilePictureId,
            u.profileUrl as profilePicture,
            up.profileType as profileType,
            db.companyBrandName as companyBrandName
        FROM UserProfile up
        LEFT JOIN up.user u
        LEFT JOIN up.doctor d
        LEFT JOIN up.organization org
        LEFT JOIN up.doctorBilling db
        WHERE up.id = :profileId
    """)
    Optional<UserProfileSummary> findSummaryById(@Param("profileId") Long profileId);

    @Query(
            """
    SELECT
        db.id as billingId,
        d.id as doctorId,
        org.id as organizationId,
        db.companyLegalName as companyLegalName,
        db.addressLine1 as addressLine1,
        db.addressLine2 as addressLine2,
        db.country as country,
        db.state as state,
        db.city as city,
        db.pincode as pincode,
        db.companyTaxId as companyTaxId,
        db.currency as currency,
        db.companyImageUrl as companyImageUrl,
        db.companyDisplayName as companyDisplayName,
        db.companyBrandName as companyBrandName,
        db.companyBrandProfilePicture as companyBrandProfilePicture,
        db.companyImage.id as companyImageId,
        db.companyBrandProfileImage.id as companyBrandProfileImageId,
        up.profileType as profileType,
        p.name as planName
    FROM UserProfile up
    LEFT JOIN up.doctorBilling db
    LEFT JOIN up.doctor d
    LEFT JOIN up.plan p
    LEFT JOIN up.organization org
    WHERE up.id = :profileId
        AND db IS NOT NULL
""")
    Optional<DoctorBillingSummary> findBillingSummaryById(@Param("profileId") Long profileId);

    @Query(
            """
            SELECT up
            FROM UserProfile up
            JOIN up.doctor d
            JOIN up.organization o
            WHERE d.id = :doctorId AND o.id = :organizationId
            """)
    Optional<UserProfile> findUserProfileByDoctorIdAndOrganizationId(
            @Param("doctorId") Long doctorId, @Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT up FROM UserProfile up
    LEFT JOIN FETCH up.organization o
    LEFT JOIN FETCH up.doctor d
    LEFT JOIN FETCH up.user us
    LEFT JOIN FETCH up.doctorBilling db
    LEFT JOIN FETCH up.inviterProfile ip
    LEFT JOIN FETCH up.roles r
    LEFT JOIN FETCH ip.user ipu
    WHERE d.id = :doctorId AND o.id = :organizationId
    """)
    Optional<UserProfile> findUserProfileByDoctorIdAndOrganizationIdWithDetails(
            @Param("doctorId") Long doctorId, @Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT
        up.id as profileId,
        u.displayName as displayName,
        u.displayProfileUrl as displayPicture,
        u.displayProfileImage.id as displayPictureId,
        u.firstName as firstName,
        u.lastName as lastName,
        u.email as email,
        u.mobileNo as mobileNo,
        u.profileUrl as profilePicture,
        u.profileImage.id as profilePictureId,
        u.salutation as salutation,
        db.companyDisplayName as companyDisplayName,
        db.companyBrandName as companyBrandName,
        db.companyBrandProfilePicture as companyBrandProfilePicture
    FROM UserProfile up
    LEFT JOIN up.user u
    LEFT JOIN up.doctorBilling db
    WHERE up.doctor.id = :doctorId
    AND up.inviterProfile.id = :inviterProfileId
""")
    Optional<UserProfileSummary> findUserProfileViewByDoctorIdAndInviterProfileId(
            @Param("doctorId") Long doctorId, @Param("inviterProfileId") Long inviterProfileId);

    @Query(
            """
    SELECT
        up.id as profileId,
        u.displayName as displayName,
        u.displayProfileUrl as displayPicture,
        u.displayProfileImage.id as displayPictureId,
        u.firstName as firstName,
        u.lastName as lastName,
        u.salutation as salutation,
        u.email as email,
        u.profileUrl as profilePicture,
        u.profileImage.id as profilePictureId,
        u.mobileNo as mobileNo,
        db.companyBrandProfilePicture as companyBrandProfilePicture,
        db.companyBrandName as companyBrandName
    FROM UserProfile up
    LEFT JOIN up.user u
    LEFT JOIN up.doctorBilling db
    WHERE up.doctor.id = :doctorId
""")
    List<UserProfileSummary> findUserProfileViewByDoctorId(@Param("doctorId") Long doctorId);

    List<UserProfile> findByDoctorId(Long doctorId);

    @Query(
            """
    SELECT
        up.id as profileId,
        u.displayName as displayName,
        up.doctor.id as doctorId,
        up.organization.id as organizationId
    FROM UserProfile up
    LEFT JOIN up.user u
    WHERE up.inviterProfile.id = :inviterProfileId
    AND up.doctor.id = :doctorId
""")
    Optional<UserProfileSummary> findUserProfileByInviterProfileIdAndDoctorId(
            @Param("inviterProfileId") Long inviterProfileId, @Param("doctorId") Long doctorId);

    @Query("SELECT up FROM UserProfile up " + "JOIN up.roles r "
            + "WHERE up.doctor.id = :doctorId AND r.name = :roleName "
            + "ORDER BY up.createdAt DESC")
    Optional<UserProfile> findTopByDoctorIdAndRoleNameOrderByCreatedAtDesc(
            @Param("doctorId") Long doctorId, @Param("roleName") String roleName);

    @Query("SELECT CASE WHEN COUNT(up) > 0 THEN true ELSE false END " + "FROM UserProfile up "
            + "WHERE up.id = :profileId AND up.doctor.id = :doctorId")
    boolean existsByIdAndDoctorId(@Param("profileId") Long profileId, @Param("doctorId") Long doctorId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " + "FROM UserProfile up JOIN up.roles r "
            + "WHERE up.id = :profileId AND r.name = :roleName")
    boolean isInternalUser(@Param("profileId") Long profileId, @Param("roleName") String roleName);

    @Query("SELECT CASE WHEN (sr.name = 'ADMIN' AND sr.subRoleTag = 'DEFAULT') THEN true ELSE false END "
            + "FROM UserProfile up "
            + "LEFT JOIN up.subRole sr "
            + "WHERE up.id = :profileId")
    Boolean isAdminWithDefaultTag(@Param("profileId") Long profileId);

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
        JOIN sub_role sr
            ON sr.id = owner.sub_role_id
        WHERE up.doctor_id = :doctorId
        AND sr.sub_role_tag = 'DEFAULT'
        AND sr.name = 'SUPER_ADMIN'
        ORDER BY owner.id
        LIMIT 1
    """,
            nativeQuery = true)
    String findOrganizationBrandNameByDoctorId(@Param("doctorId") Long doctorId);

    @Query(
            """
SELECT COUNT(u) > 0
FROM UserProfile u
JOIN u.subRole sr
WHERE u.id = :profileId
  AND sr.subRoleTag = 'DEFAULT'
  AND (sr.name = 'Planning' OR sr.name = 'Production')
""")
    Boolean isInternalUserPlanningOrProduction(@Param("profileId") Long profileId);

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
            """
    SELECT up FROM UserProfile up
    LEFT JOIN FETCH up.doctor d
    LEFT JOIN FETCH up.user u
    LEFT JOIN FETCH up.organization o
    WHERE u.email = :email AND u.xOrganizationName = :xOrganizationName
""")
    List<UserProfile> findAllByEmail(
            @Param("email") String email, @Param("xOrganizationName") String xOrganizationName);

    @Query(
            """
    SELECT up FROM UserProfile up
    LEFT JOIN FETCH up.doctor d
    LEFT JOIN FETCH up.user u
    LEFT JOIN FETCH up.organization o
    WHERE u.email = :email
""")
    List<UserProfile> findAllOnlyByEmail(@Param("email") String email);
}
