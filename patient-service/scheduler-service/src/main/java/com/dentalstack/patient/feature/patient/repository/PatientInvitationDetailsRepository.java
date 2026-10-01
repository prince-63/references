package com.dentalstack.patient.feature.patient.repository;

import com.dentalstack.patient.feature.patient.entity.PatientInvitationDetails;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientInvitationDetailsRepository extends JpaRepository<PatientInvitationDetails, Long> {
    Optional<PatientInvitationDetails> findByPatientId(Long id);
}
