package com.dentalstack.patient.feature.treatmenttracking.repository;

import com.dentalstack.patient.feature.treatmenttracking.entity.TrackingChatMessage;
import com.dentalstack.patient.feature.treatmenttracking.enums.SenderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackingChatMessageRepository extends JpaRepository<TrackingChatMessage, Long> {

    Page<TrackingChatMessage> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);

    long countByPatientIdAndIsReadFalseAndSenderTypeNot(Long patientId, SenderType senderType);
}
