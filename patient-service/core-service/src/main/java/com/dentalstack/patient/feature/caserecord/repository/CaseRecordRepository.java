package com.dentalstack.patient.feature.caserecord.repository;

import com.dentalstack.patient.feature.caserecord.entity.CaseRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseRecordRepository extends JpaRepository<CaseRecord, Long> {
    Optional<CaseRecord> findByPatientId(Long patientId);

    List<CaseRecord> findAllByPatientId(Long patientId);

    List<CaseRecord> findAllByPatientIdAndOrderId(Long patientId, String orderId);

    void deleteAllByPatientId(Long patientId);

    List<CaseRecord> findByPatientIdAndOrderIdIsNull(Long patientId);
}
