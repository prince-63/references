package com.dentalstack.patient.feature.prescription.dto.prescription;

import com.dentalstack.patient.feature.prescription.entity.Prescription;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrescriptionDetails {
    private Long id;
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

    public static PrescriptionDetails from(Prescription existingPrescription) {
        if (existingPrescription == null) {
            return null;
        }

        return PrescriptionDetails.builder()
                .id(null)
                .chiefComplaint(existingPrescription.getChiefComplaint())
                .treatmentNeeded(existingPrescription.getTreatmentNeeded())
                .doNotMoveTheFollowingTooth(existingPrescription.getDoNotMoveTheFollowingTooth())
                .midline(existingPrescription.getMidline())
                .attachments(existingPrescription.getAttachments())
                .interProximalReduction(existingPrescription.getInterProximalReduction())
                .extraction(existingPrescription.getExtraction())
                .notes(existingPrescription.getNotes())
                .midlineInstructions(existingPrescription.getMidlineInstructions())
                .attachmentsToothSelected(
                        existingPrescription.getAttachmentsToothSelected() != null
                                ? new ArrayList<>(existingPrescription.getAttachmentsToothSelected())
                                : null)
                .extractionToothSelected(
                        existingPrescription.getExtractionToothSelected() != null
                                ? new ArrayList<>(existingPrescription.getExtractionToothSelected())
                                : null)
                .treatmentNeededForTooth(
                        existingPrescription.getTreatmentNeededForTooth() != null
                                ? new ArrayList<>(existingPrescription.getTreatmentNeededForTooth())
                                : null)
                .doNotMoveTheFollowingSelectedTooth(
                        existingPrescription.getDoNotMoveTheFollowingSelectedTooth() != null
                                ? new ArrayList<>(existingPrescription.getDoNotMoveTheFollowingSelectedTooth())
                                : null)
                .data(existingPrescription.getData())
                .formId(existingPrescription.getFormId())
                .build();
    }
}
