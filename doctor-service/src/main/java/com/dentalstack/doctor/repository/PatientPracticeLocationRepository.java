package com.dentalstack.doctor.repository;

import com.dentalstack.doctor.entity.PatientPracticeLocation;
import feign.Param;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientPracticeLocationRepository extends JpaRepository<PatientPracticeLocation, Long> {
    Optional<PatientPracticeLocation> findByPatientIdAndActiveTrue(Long patientId);

    List<PatientPracticeLocation> findByPatientId(Long patientId);

    /**
     * Batch-fetch all active patient-practice-location mappings for the given patient IDs
     * in a single query, eagerly loading the associated PracticeLocation.
     * Replaces the N+1 loop pattern that previously issued 2 queries per patient.
     */
    @Query(
            """
            SELECT ppl FROM PatientPracticeLocation ppl
            LEFT JOIN FETCH ppl.practiceLocation pl
            WHERE ppl.patientId IN :patientIds
              AND ppl.active = true
            """)
    List<PatientPracticeLocation> findActiveByPatientIds(@Param("patientIds") List<Long> patientIds);
}
