package com.dentalstack.patient.feature.prescription.dto.prescription;

import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.Data;

@Data
public class PrescriptionResponseDTO {
    private Long prescriptionId;
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
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private Boolean isMappedWithOrder;

    public static PrescriptionResponseDTO from(Prescription prescription) {
        if (prescription == null) {
            return null;
        }

        PrescriptionResponseDTO dto = new PrescriptionResponseDTO();
        dto.setPrescriptionId(prescription.getId());

        if (prescription.getChiefComplaint() != null) {
            dto.setChiefComplaint(prescription.getChiefComplaint());
        }
        if (prescription.getTreatmentNeeded() != null) {
            dto.setTreatmentNeeded(prescription.getTreatmentNeeded());
        }
        if (prescription.getDoNotMoveTheFollowingTooth() != null) {
            dto.setDoNotMoveTheFollowingTooth(prescription.getDoNotMoveTheFollowingTooth());
        }
        if (prescription.getMidline() != null) {
            dto.setMidline(prescription.getMidline());
        }
        if (prescription.getAttachments() != null) {
            dto.setAttachments(prescription.getAttachments());
        }
        if (prescription.getInterProximalReduction() != null) {
            dto.setInterProximalReduction(prescription.getInterProximalReduction());
        }
        if (prescription.getExtraction() != null) {
            dto.setExtraction(prescription.getExtraction());
        }
        if (prescription.getNotes() != null) {
            dto.setNotes(prescription.getNotes());
        }
        if (prescription.getMidlineInstructions() != null) {
            dto.setMidlineInstructions(prescription.getMidlineInstructions());
        }
        if (prescription.getAttachmentsToothSelected() != null) {
            dto.setAttachmentsToothSelected(prescription.getAttachmentsToothSelected());
        }
        if (prescription.getExtractionToothSelected() != null) {
            dto.setExtractionToothSelected(prescription.getExtractionToothSelected());
        }
        if (prescription.getTreatmentNeededForTooth() != null) {
            dto.setTreatmentNeededForTooth(prescription.getTreatmentNeededForTooth());
        }
        if (prescription.getDoNotMoveTheFollowingSelectedTooth() != null) {
            dto.setDoNotMoveTheFollowingSelectedTooth(prescription.getDoNotMoveTheFollowingSelectedTooth());
        }
        if (prescription.getData() != null) {
            dto.setData(prescription.getData());
        }
        if (prescription.getFormId() != null) {
            dto.setFormId(prescription.getFormId());
        }
        if (prescription.getPatient() != null && prescription.getPatient().getId() != null) {
            dto.setPatientId(prescription.getPatient().getId());
        }
        dto.setCreatedAt(prescription.getCreatedAt());
        dto.setUpdatedAt(prescription.getUpdatedAt());

        dto.setIsMappedWithOrder(prescription.getOrderId() != null);

        return dto;
    }
}
