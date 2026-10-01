package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.doctor.entity.organization.PatientDoctorOrganization;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PatientDoctorOrganizationRepository extends JpaRepository<PatientDoctorOrganization, Long> {
    @Query("SELECT pdo.patient.id FROM PatientDoctorOrganization pdo " + "WHERE pdo.organization.id = :organizationId")
    List<Long> findPatientIdsByOrganizationId(@Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT pdo
    FROM PatientDoctorOrganization pdo
    JOIN FETCH pdo.patient p
    LEFT JOIN FETCH pdo.userProfile up
    LEFT JOIN FETCH up.user u
    WHERE pdo.patient.id = :patientId
    """)
    Optional<PatientDoctorOrganization> findPatientDoctorOrganizationsWithPatientByPatientId(
            @Param("patientId") Long patientId);

    @Query(
            """
    SELECT pdo.patient.id FROM PatientDoctorOrganization pdo
    WHERE pdo.organization.id = :organizationId
    AND pdo.patient.patientStatus != 'ARCHIVE'
""")
    List<Long> findPatientIdsByOrganizationIdWithoutArchive(@Param("organizationId") Long organizationId);

    @Query(
            """
    SELECT pdo.patient.id FROM PatientDoctorOrganization pdo
    WHERE pdo.doctor.id = :doctorId
    AND pdo.organization.id = :organizationId
    AND pdo.userProfile.id = :profileId
    AND pdo.patient.patientStatus != 'ARCHIVE'
""")
    List<Long> findPatientIdsByDoctorOrgAndProfileWithoutArchive(
            @Param("doctorId") Long doctorId,
            @Param("organizationId") Long organizationId,
            @Param("profileId") Long profileId);

    PatientDoctorOrganization findByPatientIdAndDoctorId(Long patientId, Long doctorId);
}
