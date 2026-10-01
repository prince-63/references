package com.dentalstack.doctor.repository.patient;

import com.dentalstack.doctor.entity.patient.organization.PatientDoctorOrganization;
import feign.Param;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PatientDoctorOrganizationRepository extends JpaRepository<PatientDoctorOrganization, Long> {
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
}
