package com.dentalstack.patient.feature.feedback.repository;

import com.dentalstack.patient.feature.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {}
