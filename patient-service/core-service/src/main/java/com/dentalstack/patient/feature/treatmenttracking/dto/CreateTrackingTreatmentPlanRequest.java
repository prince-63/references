package com.dentalstack.patient.feature.treatmenttracking.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateTrackingTreatmentPlanRequest {
    private Long patientId;
    private String name;

    private Integer upperAlignerStartNo;
    private Integer upperAlignerEndNo;

    private Integer lowerAlignerStartNo;
    private Integer lowerAlignerEndNo;

    private Integer currentAlignerNumber;

    private Integer wearDaysPerAligner;
    private LocalDate startDate;
    private String planningLink;
    private String iprAttachmentChart;
    private Long profileId;
}
