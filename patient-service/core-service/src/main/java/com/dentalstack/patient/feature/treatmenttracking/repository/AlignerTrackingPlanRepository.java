package com.dentalstack.patient.feature.treatmenttracking.repository;

import com.dentalstack.patient.feature.treatmenttracking.entity.AlignerTrackingPlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlignerTrackingPlanRepository extends JpaRepository<AlignerTrackingPlan, Long> {

    List<AlignerTrackingPlan> findByPatientIdOrderByVersionAsc(Long patientId);

    Optional<AlignerTrackingPlan> findByPatientIdAndCurrentAlignerNumberIsNotNull(Long patientId);

    int countByPatientId(Long patientId);
}
