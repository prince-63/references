package com.dentalstack.patient.feature.treatment.dto;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TreatmentCompleted {
    private Long patientId;
    private String treatmentId;
    private String treatmentPlanName;
    private String patientName;
    private String practiceName;
    private LocalDate treatmentCompletionDate;
    private String treatmentCompletionRemark;
}
