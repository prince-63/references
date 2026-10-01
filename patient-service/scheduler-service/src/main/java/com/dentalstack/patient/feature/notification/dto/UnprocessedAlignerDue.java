package com.dentalstack.patient.feature.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnprocessedAlignerDue {
    private String email;
    private String patientName;
    private String dueDate;
    private String upperStart;
    private String upperEnd;
    private String lowerStart;
    private String lowerEnd;
    private String orgName;
}
