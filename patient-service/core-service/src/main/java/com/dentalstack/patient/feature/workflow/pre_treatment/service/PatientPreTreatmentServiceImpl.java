package com.dentalstack.patient.feature.workflow.pre_treatment.service;

import com.dentalstack.patient.feature.caserecord.dto.CaseRecordDetails;
import com.dentalstack.patient.feature.caserecord.entity.CaseRecord;
import com.dentalstack.patient.feature.caserecord.exception.CaseRecordNotFoundException;
import com.dentalstack.patient.feature.caserecord.repository.CaseRecordRepository;
import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionDetails;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.dentalstack.patient.feature.prescription.exception.PrescriptionNotExitsException;
import com.dentalstack.patient.feature.prescription.repository.PrescriptionRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.pre_treatment.dto.PatientPreTreatmentRequest;
import com.dentalstack.patient.feature.workflow.pre_treatment.dto.PatientPreTreatmentResponse;
import com.dentalstack.patient.feature.workflow.pre_treatment.entity.PatientPreTreatmentDetails;
import com.dentalstack.patient.feature.workflow.pre_treatment.repository.PatientPreTreatmentRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class PatientPreTreatmentServiceImpl implements PatientPreTreatmentService {

    private final PatientPreTreatmentRepository preTreatmentRepository;
    private final PatientRepository patientRepository;
    private final UserProfileRepository userProfileRepository;
    private final CaseRecordRepository caseRecordRepository;
    private final PrescriptionRepository prescriptionRepository;

    @Override
    @Transactional
    public PatientPreTreatmentResponse createPreTreatmentDetails(PatientPreTreatmentRequest request) {
        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        UserProfile addedBy = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getAddedByProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getAddedByProfileId()));

        List<PatientPreTreatmentDetails> existingActiveDetails =
                preTreatmentRepository.findAllByPatientIdAndActive(request.getPatientId());

        if (!existingActiveDetails.isEmpty()) {
            existingActiveDetails.forEach(detail -> detail.setActive(false));
            preTreatmentRepository.saveAll(existingActiveDetails);
        }

        PatientPreTreatmentDetails preTreatmentDetails = PatientPreTreatmentDetails.builder()
                .patient(patient)
                .addedBy(addedBy)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        if (request.getCaseRecordId() != null) {
            CaseRecord caseRecord = caseRecordRepository
                    .findById(request.getCaseRecordId())
                    .orElseThrow(() -> new CaseRecordNotFoundException(request.getCaseRecordId()));
            preTreatmentDetails.setCaseRecord(caseRecord);
        }

        if (request.getPrescriptionId() != null) {
            Prescription prescription = prescriptionRepository
                    .findById(request.getPrescriptionId())
                    .orElseThrow(() -> new PrescriptionNotExitsException(request.getPrescriptionId()));
            preTreatmentDetails.setPrescription(prescription);
        }

        PatientPreTreatmentDetails savedDetails = preTreatmentRepository.save(preTreatmentDetails);

        return mapToResponse(savedDetails);
    }

    @Override
    @Transactional
    public PatientPreTreatmentResponse updatePreTreatmentDetails(Long id, PatientPreTreatmentRequest request) {
        PatientPreTreatmentDetails existingDetails = preTreatmentRepository
                .findById(id)
                .orElseThrow(() -> new GenericException("Pre-treatment details not found with ID: " + id));

        Patient patient = patientRepository
                .findById(request.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(request.getPatientId()));

        UserProfile addedBy = userProfileRepository
                .findById(request.getAddedByProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getAddedByProfileId()));

        existingDetails.setPatient(patient);
        existingDetails.setAddedBy(addedBy);

        if (request.getIsActive() != null) {
            existingDetails.setActive(request.getIsActive());
        }

        if (request.getCaseRecordId() != null) {
            CaseRecord caseRecord = caseRecordRepository
                    .findById(request.getCaseRecordId())
                    .orElseThrow(() -> new CaseRecordNotFoundException(request.getCaseRecordId()));
            existingDetails.setCaseRecord(caseRecord);
        } else {
            existingDetails.setCaseRecord(null);
        }

        if (request.getPrescriptionId() != null) {
            Prescription prescription = prescriptionRepository
                    .findById(request.getPrescriptionId())
                    .orElseThrow(() -> new PrescriptionNotExitsException(request.getPrescriptionId()));
            existingDetails.setPrescription(prescription);
        } else {
            existingDetails.setPrescription(null);
        }

        PatientPreTreatmentDetails updatedDetails = preTreatmentRepository.save(existingDetails);

        return mapToResponse(updatedDetails);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientPreTreatmentResponse getPreTreatmentDetails(Long id) {
        PatientPreTreatmentDetails preTreatmentDetails = preTreatmentRepository
                .findByPatientIdAndActive(id)
                .orElseThrow(() -> new GenericException("Pre-treatment details not found with ID: " + id));

        return mapToResponse(preTreatmentDetails);
    }

    private PatientPreTreatmentResponse mapToResponse(PatientPreTreatmentDetails details) {
        return PatientPreTreatmentResponse.builder()
                .id(details.getId())
                .patientId(details.getPatient().getId())
                .patientName(details.getPatient().fullName())
                .addedByProfileId(details.getAddedBy().getId())
                .addedByName(details.getAddedBy().getUser().fullNameWithSalutation())
                .prescriptionDetails(
                        details.getCaseRecord() != null ? PrescriptionDetails.from(details.getPrescription()) : null)
                .caseRecordDetails(
                        details.getPrescription() != null ? CaseRecordDetails.from(details.getCaseRecord()) : null)
                .isActive(details.isActive())
                .createdAt(details.getCreatedAt())
                .updatedAt(details.getUpdatedAt())
                .build();
    }
}
