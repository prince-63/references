package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.summary.DoctorDetailsSummary;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUUIDAndActiveTrue(String doctorCode);

    Optional<Doctor> findByUUID(String UUID);

    Optional<Doctor> findByEmailAndActiveTrue(String doctorCodeEmailMobile);

    Optional<Doctor> findByEmail(String emailId);

    Optional<Doctor> findByMobileAndActiveTrue(String doctorCodeEmailMobile);

    Optional<Doctor> findByIdAndActiveTrue(Long doctorId);

    boolean existsByEmailAndActiveTrue(String email);

    @Query(
            """
    SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END
    FROM Doctor d
    WHERE d.email = :email
      AND d.organizationId = :organizationId
      AND d.xOrganizationName = :xOrgName
      AND d.active = true
""")
    boolean existsByEmailAndOrganizationIdAndXOrgNameActiveTrue(
            @Param("email") String email,
            @Param("organizationId") Long organizationId,
            @Param("xOrgName") String xOrgName);

    boolean existsByMobileAndActiveTrue(String mobileNumber);

    @Query(
            """
    SELECT DISTINCT d FROM Doctor d
    LEFT JOIN FETCH d.organizations o
    LEFT JOIN FETCH d.userProfiles p
    LEFT JOIN FETCH p.roles r
    LEFT JOIN FETCH r.allowedFeatures af
    LEFT JOIN FETCH af.feature f
    LEFT JOIN FETCH af.permission perm
    LEFT JOIN FETCH p.organization po
    LEFT JOIN FETCH p.user u
    LEFT JOIN FETCH p.inviterProfile ip
    LEFT JOIN FETCH p.doctor pd
    LEFT JOIN FETCH p.doctorBilling db
    WHERE d.id = :id
""")
    Optional<Doctor> findByIdWithAllDetails(@Param("id") Long id);

    @Query(
            """
        SELECT d.id as id,
               d.UUID as UUID,
               d.firstName as firstName,
               d.lastName as lastName,
               d.email as email,
               d.mobile as mobile,
               d.countryName as countryName,
               d.isDrToDisplay as isDrToDisplay,
               d.isOnBoardScreenVisited as isOnBoardScreenVisited,
               d.description as description,
               d.profileImage as profileImage,
               org.id as organizationId,
               org.name as organizationName,
               org.description as organizationDescription,
               org.active as organizationActive,
               prof.id as profileId,
               prof.profileType as profileType,
               prof.status as profileStatus
        FROM Doctor d
        LEFT JOIN d.organizations org
        LEFT JOIN d.userProfiles prof
        WHERE d.id = :doctorId
    """)
    DoctorDetailsSummary findDoctorDetailsById(@Param("doctorId") Long doctorId);

    @Query(
            """
    SELECT d FROM Doctor d
    LEFT JOIN FETCH d.userProfiles p
    LEFT JOIN FETCH d.organizations o
    WHERE d.id = :id
""")
    Optional<Doctor> findByIdWithAllDetailsWithProfile(@Param("id") Long id);

    @Query("SELECT d.id FROM Doctor d")
    List<Long> findAllDoctorId();

    List<Doctor> findByEmailIn(List<String> emails);

    Optional<Doctor> findByMobileAndOrgNameAndActiveTrue(String doctorMobile, String orgName);

    @Query(
            """
        SELECT d FROM Doctor AS d
        LEFT JOIN FETCH d.primaryUserProfile AS pup
        LEFT JOIN FETCH pup.roles AS r
        LEFT JOIN FETCH pup.user AS u
        WHERE d.id = :addedByUserId
     """)
    Doctor findAddedByUser(@Param("addedByUserId") Long addedByUserId);

    @Query(
            """
    SELECT DISTINCT d FROM Doctor d
    LEFT JOIN FETCH d.organizations o
    LEFT JOIN FETCH d.userProfiles p
    LEFT JOIN FETCH p.roles r
    LEFT JOIN FETCH r.allowedFeatures af
    LEFT JOIN FETCH af.feature f
    LEFT JOIN FETCH af.permission perm
    LEFT JOIN FETCH p.organization po
    LEFT JOIN FETCH p.user u
    LEFT JOIN FETCH p.inviterProfile ip
    LEFT JOIN FETCH p.doctor pd
    LEFT JOIN FETCH p.doctorBilling db
    LEFT JOIN FETCH p.plan pl
    WHERE LOWER(d.email) = LOWER(:emailId)
    AND d.organizationId = :organizationId
    AND d.xOrganizationName = :xOrgName
""")
    Optional<Doctor> findByEmailWithAllDetails(
            @Param("emailId") String emailId,
            @Param("organizationId") Long organizationId,
            @Param("xOrgName") String xOrgName);

    @Query(
            """
    SELECT d FROM Doctor d
    WHERE d.email = :email
      AND d.organizationId = :organizationId
      AND d.xOrganizationName = :xOrgName
""")
    Optional<Doctor> findByEmailAndOrgIdAndXOrgName(
            @Param("email") String email,
            @Param("organizationId") Long organizationId,
            @Param("xOrgName") String xOrgName);
}
