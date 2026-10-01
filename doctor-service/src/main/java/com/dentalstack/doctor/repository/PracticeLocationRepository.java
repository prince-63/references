package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.PracticeLocation;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PracticeLocationRepository extends JpaRepository<PracticeLocation, Long> {
    List<PracticeLocation> findByPracticeLocationNameAndDoctorIdAndUserProfileIdAndActiveTrueAndAddress(
            String practiceLocationName, Long doctorId, Long profileId, String address);

    List<PracticeLocation> findByPracticeLocationNameAndDoctorIdAndUserProfileIdAndAddress(
            String practiceLocationName, Long doctorId, Long profileId, String address);

    List<PracticeLocation> findByMobileNumberAndActiveTrue(String mobileNumber);

    List<PracticeLocation> findByDoctorId(Long doctorId);

    Optional<PracticeLocation> findByIdAndActiveTrue(Long practiceLocationId);

    Optional<PracticeLocation> findByPatientIdAndActiveTrue(Long patientId);

    Optional<PracticeLocation> findByDoctorIdAndPracticeLocationTypeAndActiveTrue(Long doctorId, String primary);

    long countByDoctorIdAndActiveTrue(Long doctorId);

    List<PracticeLocation> findByDoctorIdAndActiveTrue(Long doctorId);

    Optional<PracticeLocation> findByPatientId(Long patientId);

    Long countByDoctorId(Long doctorId);

    @Query(
            """
    SELECT DISTINCT pl FROM PracticeLocation pl
    WHERE pl.doctorId = :doctorId
    AND pl.userProfile.id = :profileId
    AND pl.organization.id = :organizationId
    ORDER BY pl.practiceLocationName ASC
""")
    List<PracticeLocation> findByDoctorIdAndProfileAndOrg(
            @Param("doctorId") Long doctorId,
            @Param("profileId") Long profileId,
            @Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT DISTINCT pl FROM PracticeLocation pl
    WHERE pl.doctorId = :doctorId
    AND pl.userProfile.id = :profileId
    AND pl.organization.id = :organizationId
    AND pl.active = true
    ORDER BY pl.practiceLocationName ASC
    """)
    List<PracticeLocation> findByDoctorIdAndProfileAndOrgWithActive(
            @Param("doctorId") Long doctorId,
            @Param("profileId") Long profileId,
            @Param("organizationId") Long organizationId);

    @Query("SELECT pl.id FROM PracticeLocation pl")
    List<Long> findAllPracticeLocationIds();
}
