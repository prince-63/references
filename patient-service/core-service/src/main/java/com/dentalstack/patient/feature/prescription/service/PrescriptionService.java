package com.dentalstack.patient.feature.prescription.service;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionDetails;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionRequestDTO;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionUpdateRequestDTO;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import java.util.List;

public interface PrescriptionService {
    Prescription addPrescription(Patient patient, PrescriptionDetails prescriptionDetails, String orderId);

    Prescription createPrescription(PrescriptionRequestDTO prescriptionRequestDTO);

    Prescription getPrescriptionById(Long prescriptionId);

    List<Prescription> getPrescriptionByPatientId(Long patientId);

    Prescription updatePrescription(Patient patient, PrescriptionDetails prescriptionDetails, String orderId);

    Prescription updatePrescription(Long prescriptionId, PrescriptionUpdateRequestDTO prescriptionRequestDTO);

    void deletePrescription(Long prescriptionId);

    List<Prescription> getPrescriptionsByPatientIdAndOrderId(Long patientId, String orderId);
}
