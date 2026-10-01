package com.dentalstack.patient.feature.prescription.dto.prescription;

import com.dentalstack.patient.feature.prescription.entity.Prescription;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PrescriptionDetailsDTO {
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

    public static PrescriptionDetailsDTO from(Prescription prescription) {
        return PrescriptionDetailsDTO.builder()
                .id(prescription.getId())
                .chiefComplaint(prescription.getChiefComplaint())
                .treatmentNeeded(prescription.getTreatmentNeeded())
                .doNotMoveTheFollowingTooth(prescription.getDoNotMoveTheFollowingTooth())
                .midline(prescription.getMidline())
                .attachments(prescription.getAttachments())
                .interProximalReduction(prescription.getInterProximalReduction())
                .extraction(prescription.getExtraction())
                .notes(prescription.getNotes())
                .midlineInstructions(prescription.getMidlineInstructions())
                .attachmentsToothSelected(prescription.getAttachmentsToothSelected())
                .extractionToothSelected(prescription.getExtractionToothSelected())
                .treatmentNeededForTooth(prescription.getTreatmentNeededForTooth())
                .doNotMoveTheFollowingSelectedTooth(prescription.getDoNotMoveTheFollowingSelectedTooth())
                .build();
    }
}
