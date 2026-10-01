package com.dentalstack.patient.feature.treatmenttracking.repository;

import com.dentalstack.patient.feature.treatmenttracking.entity.AlignerReview;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlignerReviewRepository extends JpaRepository<AlignerReview, Long> {

    List<AlignerReview> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    Optional<AlignerReview> findByPatientIdAndAlignerStageId(Long patientId, Long alignerStageId);
}
