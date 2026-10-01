package com.dentalstack.patient.feature.prescription.service;

import com.dentalstack.patient.feature.order.entity.Order;
import com.dentalstack.patient.feature.order.repository.OrderRepository;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.exception.PatientNotFoundException;
import com.dentalstack.patient.feature.patient.repository.PatientRepository;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionDetails;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionRequestDTO;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionUpdateRequestDTO;
import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.dentalstack.patient.feature.prescription.exception.PrescriptionNotExitsException;
import com.dentalstack.patient.feature.prescription.repository.PrescriptionRepository;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.core.workflows.service.notification.WorkflowManagementNotificationService;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import com.dentalstack.patient.global.exception.BusinessException;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {
    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository patientRepository;
    private final OrderRepository orderRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkflowManagementNotificationService notificationService;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    @Transactional(rollbackFor = {BusinessException.class})
    public Prescription addPrescription(Patient patient, PrescriptionDetails prescriptionDetails, String orderId) {
        Prescription prescription = mapToEntity(prescriptionDetails);
        prescription.setPatient(patient);
        prescription.setOrderId(orderId);
        return prescriptionRepository.save(prescription);
    }

    @Transactional
    @Override
    public Prescription createPrescription(PrescriptionRequestDTO prescriptionRequestDTO) {
        Patient patient = patientRepository
                .findByIdWithDoctorProfileDetails(prescriptionRequestDTO.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(prescriptionRequestDTO.getPatientId()));

        var orderId =
                orderRepository.findLatestOrderIdByPatientId(patient.getId()).orElse(null);
        if (prescriptionRequestDTO.getProfileId() != null) {
            Optional<UserProfile> userProfile = userProfileRepository.findByIdWithOrgAndDoctorAndUseWithInviterRoles(
                    prescriptionRequestDTO.getProfileId());

            userProfile.ifPresent(profile -> {
                if (!serviceConfigurationRepository.isPlanningUser(profile.getId())) {
                    notificationService.prescriptionAdded(userProfile.get(), patient, orderId);
                }
            });
        }

        Prescription prescription = PrescriptionRequestDTO.from(prescriptionRequestDTO);
        prescription.setPatient(patient);
        prescription.setOrderId(orderId);
        prescriptionRepository.save(prescription);

        return prescription;
    }

    @Override
    public Prescription getPrescriptionById(Long prescriptionId) {
        Optional<Prescription> prescription = prescriptionRepository.findByPrescriptionId(prescriptionId);
        return prescription.orElse(null);
    }

    @Override
    public List<Prescription> getPrescriptionByPatientId(Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    @Transactional(rollbackFor = {BusinessException.class})
    public Prescription updatePrescription(Patient patient, PrescriptionDetails prescriptionDetails, String orderId) {

        Prescription prescription =
                prescriptionRepository.findById(prescriptionDetails.getId()).orElseThrow();
        prescription.setPatient(patient);

        if (prescriptionDetails.getChiefComplaint() != null) {
            updateEntityFromDto(prescription, prescriptionDetails, orderId);
        }

        return prescriptionRepository.save(prescription);
    }

    @Override
    public Prescription updatePrescription(Long prescriptionId, PrescriptionUpdateRequestDTO dto) {
        Prescription existingPrescription = prescriptionRepository
                .findById(prescriptionId)
                .orElseThrow(() -> new PrescriptionNotExitsException(prescriptionId));

        var patientId = existingPrescription.getPatient().getId();

        var orderId = orderRepository.findLatestOrderIdByPatientId(patientId).orElse(null);
        if (dto.getChiefComplaint() != null) {
            existingPrescription.setChiefComplaint(dto.getChiefComplaint());
        }
        if (dto.getTreatmentNeeded() != null) {
            existingPrescription.setTreatmentNeeded(dto.getTreatmentNeeded());
        }
        if (dto.getDoNotMoveTheFollowingTooth() != null) {
            existingPrescription.setDoNotMoveTheFollowingTooth(dto.getDoNotMoveTheFollowingTooth());
        }
        if (dto.getMidline() != null) {
            existingPrescription.setMidline(dto.getMidline());
        }
        if (dto.getAttachments() != null) {
            existingPrescription.setAttachments(dto.getAttachments());
        }
        if (dto.getInterProximalReduction() != null) {
            existingPrescription.setInterProximalReduction(dto.getInterProximalReduction());
        }
        if (dto.getExtraction() != null) {
            existingPrescription.setExtraction(dto.getExtraction());
        }
        if (dto.getNotes() != null) {
            existingPrescription.setNotes(dto.getNotes());
        }
        if (dto.getMidlineInstructions() != null) {
            existingPrescription.setMidlineInstructions(dto.getMidlineInstructions());
        }
        if (dto.getAttachmentsToothSelected() != null) {
            existingPrescription.setAttachmentsToothSelected(dto.getAttachmentsToothSelected());
        }
        if (dto.getExtractionToothSelected() != null) {
            existingPrescription.setExtractionToothSelected(dto.getExtractionToothSelected());
        }
        if (dto.getTreatmentNeededForTooth() != null) {
            existingPrescription.setTreatmentNeededForTooth(dto.getTreatmentNeededForTooth());
        }
        if (dto.getDoNotMoveTheFollowingSelectedTooth() != null) {
            existingPrescription.setDoNotMoveTheFollowingSelectedTooth(dto.getDoNotMoveTheFollowingSelectedTooth());
        }
        if (dto.getData() != null) {
            existingPrescription.setData(dto.getData());
        }
        if (orderId != null) {
            existingPrescription.setOrderId(orderId);
        }

        return prescriptionRepository.save(existingPrescription);
    }

    @Override
    public void deletePrescription(Long prescriptionId) {
        Prescription existingPrescription = prescriptionRepository
                .findById(prescriptionId)
                .orElseThrow(() -> new PrescriptionNotExitsException(prescriptionId));
        List<Order> orders = orderRepository.findByPrescription(existingPrescription);
        for (Order order : orders) {
            order.setPrescription(null);
            orderRepository.save(order);
        }
        prescriptionRepository.delete(existingPrescription);
    }

    public List<Prescription> getPrescriptionsByPatientIdAndOrderId(Long patientId, String orderId) {
        return prescriptionRepository.findByPatientIdAndOrderId(patientId, orderId);
    }

    private void updateEntityFromDto(
            Prescription prescription, PrescriptionDetails prescriptionDetails, String orderId) {
        prescription.setChiefComplaint(prescriptionDetails.getChiefComplaint());
        prescription.setTreatmentNeeded(prescriptionDetails.getTreatmentNeeded());
        prescription.setDoNotMoveTheFollowingTooth(prescriptionDetails.getDoNotMoveTheFollowingTooth());
        prescription.setMidline(prescriptionDetails.getMidline());
        prescription.setAttachments(prescriptionDetails.getAttachments());
        prescription.setInterProximalReduction(prescriptionDetails.getInterProximalReduction());
        prescription.setExtraction(prescriptionDetails.getExtraction());
        prescription.setNotes(prescriptionDetails.getNotes());
        prescription.setDoNotMoveTheFollowingSelectedTooth(prescriptionDetails.getDoNotMoveTheFollowingSelectedTooth());
        prescription.setMidlineInstructions(prescriptionDetails.getMidlineInstructions());
        prescription.setAttachmentsToothSelected(prescriptionDetails.getAttachmentsToothSelected());
        prescription.setExtractionToothSelected(prescriptionDetails.getExtractionToothSelected());
        prescription.setTreatmentNeededForTooth(prescriptionDetails.getTreatmentNeededForTooth());
        prescription.setFormId(prescriptionDetails.getFormId());
        prescription.setData(prescriptionDetails.getData());
        prescription.setOrderId(orderId);
    }

    private Prescription mapToEntity(PrescriptionDetails prescriptionDetails) {
        return Prescription.builder()
                .chiefComplaint(prescriptionDetails.getChiefComplaint())
                .treatmentNeeded(prescriptionDetails.getTreatmentNeeded())
                .doNotMoveTheFollowingTooth(prescriptionDetails.getDoNotMoveTheFollowingTooth())
                .midline(prescriptionDetails.getMidline())
                .attachments(prescriptionDetails.getAttachments())
                .interProximalReduction(prescriptionDetails.getInterProximalReduction())
                .extraction(prescriptionDetails.getExtraction())
                .notes(prescriptionDetails.getNotes())
                .doNotMoveTheFollowingSelectedTooth(prescriptionDetails.getDoNotMoveTheFollowingSelectedTooth())
                .midlineInstructions(prescriptionDetails.getMidlineInstructions())
                .attachmentsToothSelected(prescriptionDetails.getAttachmentsToothSelected())
                .extractionToothSelected(prescriptionDetails.getExtractionToothSelected())
                .treatmentNeededForTooth(prescriptionDetails.getTreatmentNeededForTooth())
                .data(prescriptionDetails.getData())
                .formId(prescriptionDetails.getFormId())
                .build();
    }
}
