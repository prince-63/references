package com.dentalstack.patient.feature.doctor.repository;

import com.dentalstack.patient.feature.doctor.entity.Doctor;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    @Query("SELECT DISTINCT d.id FROM Doctor d")
    List<Long> findAllDoctorIds();

    Optional<Doctor> findByEmail(String emailId);

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
    SELECT d
    FROM Doctor d
    WHERE d.email = :email
      AND d.organizationId = :organizationId
      AND d.xOrganizationName = :xOrgName
""")
    Optional<Doctor> findByEmailAndOrganizationIdAndXOrgName(
            @Param("email") String email,
            @Param("organizationId") Long organizationId,
            @Param("xOrgName") String xOrgName);

    @Query(
            """
    SELECT d FROM Doctor d
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
    WHERE d.email = :email
""")
    Optional<Doctor> findByIdWithAllDetails(@Param("email") String email);

    @Query("SELECT d FROM Doctor AS d WHERE d.id = :addedByUserId")
    Doctor findAddedByUserId(@Param("addedByUserId") Long addedByUserId);

    @Query(
            """
        SELECT d FROM Doctor AS d
        LEFT JOIN FETCH d.primaryUserProfile AS pup
        LEFT JOIN FETCH pup.roles AS r
        LEFT JOIN FETCH pup.user AS u
        WHERE d.id = :addedByUserId
     """)
    Doctor findAddedByUser(@Param("addedByUserId") Long addedByUserId);
}
