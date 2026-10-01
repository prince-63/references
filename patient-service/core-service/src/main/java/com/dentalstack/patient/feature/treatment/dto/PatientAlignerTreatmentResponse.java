package com.dentalstack.patient.feature.treatment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatientAlignerTreatmentResponse {
    private List<TreatmentPlanDTO> treatmentPlans;
    private Boolean isTreatmentPlanCreated;
    private Boolean isSingleTreatment;
    private Boolean isTreatmentPlanApprovedByPatient;
    private LocalDate approvedByPatientAt;

    public static PatientAlignerTreatmentResponse from(
            List<TreatmentPlanDTO> treatmentPlan,
            Boolean isTreatmentPlanCreated,
            Boolean isSingleTreatment,
            Boolean isTreatmentPlanApprovedByPatient,
            LocalDate approvedByPatientAt) {
        return PatientAlignerTreatmentResponse.builder()
                .treatmentPlans(treatmentPlan)
                .isTreatmentPlanCreated(isTreatmentPlanCreated)
                .isSingleTreatment(isSingleTreatment)
                .isTreatmentPlanApprovedByPatient(isTreatmentPlanApprovedByPatient)
                .approvedByPatientAt(approvedByPatientAt)
                .build();
    }
}
