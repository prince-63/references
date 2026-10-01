package com.dentalstack.patient.feature.manufacturing;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UnprocessedAlignerData {
    private Long treatmentPlanId;
    private Long patientId;
    private String patientFullName;
    private String customerName;
    private LocalDate dueBy;
    private int daysUntilDue;
    private AlignerInfo totalAligners;
    private AlignerInfo delivered;
    private AlignerInfo pending;
    private String userEmail;
    private String orgName;
}
