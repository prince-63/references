package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.vsp.entity.VspCaseRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VspCaseRecordRepository extends JpaRepository<VspCaseRecord, Long> {

    List<VspCaseRecord> findAllByVspOrderId(String vspOrderId);

    List<VspCaseRecord> findAllByPatientId(Long patientId);
}
