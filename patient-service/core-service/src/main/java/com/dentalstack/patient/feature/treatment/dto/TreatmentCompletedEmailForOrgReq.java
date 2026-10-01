package com.dentalstack.patient.feature.treatment.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TreatmentCompletedEmailForOrgReq {
    private String orgEmail;
    private String patientName;
    private String practiceName;
    private String treatmentPlanName;
    private LocalDate completionDate;
    private String orderId;
    private String orgName;
}
