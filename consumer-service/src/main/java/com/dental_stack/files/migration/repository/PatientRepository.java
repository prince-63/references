package com.dental_stack.files.migration.repository;

import com.dental_stack.files.migration.entity.Patient;
import com.dental_stack.files.migration.projections.LoadPatientMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    @Query(
            value =
                    """
    SELECT
        p.id as id,
        p.first_name as firstName,
        p.last_name as lastName
    FROM patient AS p
    WHERE p.id = :patientId
    """,
            nativeQuery = true)
    LoadPatientMetadata loadPatientMetadata(@Param("patientId") Long patientId);
}
