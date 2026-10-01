package com.dentalstack.patient.feature.vsp.repository;

import com.dentalstack.patient.feature.vsp.entity.VspPrescription;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VspPrescriptionRepository extends JpaRepository<VspPrescription, Long> {

    List<VspPrescription> findAllByVspOrderId(String orderId);

    List<VspPrescription> findAllByPatientId(Long patientId);
}
