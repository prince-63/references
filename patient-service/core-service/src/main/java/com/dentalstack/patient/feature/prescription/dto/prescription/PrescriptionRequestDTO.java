package com.dentalstack.patient.feature.prescription.dto.prescription;

import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import lombok.Data;

@Data
public class PrescriptionRequestDTO {
    private String chiefComplaint;
    private String treatmentNeeded;
    private String doNotMoveTheFollowingTooth;
    private String midline;
    private String attachments;
    private String interProximalReduction;
    private String extraction;
    private String notes;
    private String midlineInstructions;
    private List<String> attachmentsToothSelected;
    private List<String> extractionToothSelected;
    private List<String> treatmentNeededForTooth;
    private List<String> doNotMoveTheFollowingSelectedTooth;
    private JsonNode data;
    private String formId;
    private Long patientId;
    private Long profileId;
    private String orderId;

    public static Prescription from(PrescriptionRequestDTO prescriptionRequestDTO) {
        return Prescription.builder()
                .chiefComplaint(prescriptionRequestDTO.getChiefComplaint())
                .treatmentNeeded(prescriptionRequestDTO.getTreatmentNeeded())
                .doNotMoveTheFollowingTooth(prescriptionRequestDTO.getDoNotMoveTheFollowingTooth())
                .midline(prescriptionRequestDTO.getMidline())
                .attachments(prescriptionRequestDTO.getAttachments())
                .interProximalReduction(prescriptionRequestDTO.getInterProximalReduction())
                .extraction(prescriptionRequestDTO.getExtraction())
                .notes(prescriptionRequestDTO.getNotes())
                .midlineInstructions(prescriptionRequestDTO.getMidlineInstructions())
                .attachmentsToothSelected(prescriptionRequestDTO.getAttachmentsToothSelected())
                .extractionToothSelected(prescriptionRequestDTO.getExtractionToothSelected())
                .treatmentNeededForTooth(prescriptionRequestDTO.getTreatmentNeededForTooth())
                .doNotMoveTheFollowingSelectedTooth(prescriptionRequestDTO.getDoNotMoveTheFollowingSelectedTooth())
                .data(prescriptionRequestDTO.getData())
                .formId(prescriptionRequestDTO.getFormId())
                .orderId(prescriptionRequestDTO.getOrderId())
                .build();
    }
}
