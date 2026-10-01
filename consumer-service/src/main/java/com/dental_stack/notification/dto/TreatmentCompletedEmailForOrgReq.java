package com.dental_stack.notification.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
