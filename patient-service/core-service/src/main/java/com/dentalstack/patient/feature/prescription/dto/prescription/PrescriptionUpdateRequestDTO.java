package com.dentalstack.patient.feature.prescription.dto.prescription;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import lombok.Data;

@Data
public class PrescriptionUpdateRequestDTO {
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
}
