package com.dental_stack.files.migration.repository;

import com.dental_stack.files.migration.entity.PatientDoctorOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientDoctorOrganizationRepository
        extends JpaRepository<PatientDoctorOrganization, Long> {

    @Query(
            value =
                    """
    SELECT u.email FROM patient_doctor_organization AS pdo
    JOIN user_profile up ON up.id = pdo.user_profile_id
    JOIN users u ON u.id = up.user_id
    WHERE pdo.patient_id = :patientId
    """,
            nativeQuery = true)
    String findCustomerEmailByPatientId(@Param("patientId") Long patientId);
}
