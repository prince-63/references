package com.dentalstack.patient.feature.smartbox.repository;

import com.dentalstack.patient.feature.smartbox.entity.SmartBox;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmartBoxRepository extends JpaRepository<SmartBox, Long> {
    Optional<SmartBox> findByPatientId(String patientId);
}
