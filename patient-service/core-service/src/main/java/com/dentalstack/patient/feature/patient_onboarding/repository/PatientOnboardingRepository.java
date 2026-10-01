package com.dentalstack.patient.feature.patient_onboarding.repository;

import com.dentalstack.patient.feature.patient_onboarding.entity.PatientOnboarding;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PatientOnboardingRepository extends JpaRepository<PatientOnboarding, Long> {
    Optional<PatientOnboarding> findByPatientId(Long patientId);

    @Query(
            value =
                    """
        SELECT EXISTS (
            SELECT 1
            FROM patient_onboarding po
            WHERE po.patient_id = :patientId
            AND po.current_step = 'COMPLETED'
        )
        """,
            nativeQuery = true)
    Boolean isOnboardingCompleted(@Param("patientId") Long patientId);
}
