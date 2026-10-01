package com.dentalstack.patient.feature.aligner.repository;

import com.dentalstack.patient.feature.aligner.entity.AlignerFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AlignerFeedbackRepository extends JpaRepository<AlignerFeedback, Long> {}
