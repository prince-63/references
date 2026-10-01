package com.dentalstack.patient.feature.treatmenttracking.dto;

import com.dentalstack.patient.feature.treatmenttracking.enums.TreatmentPlanStatus;
import java.util.List;
import lombok.Data;

@Data
public class TreatmentPlanResponse {
    private Long id;
    private String name;
    private Integer version;

    private Integer upperAlignerStartNo;
    private Integer upperAlignerEndNo;

    private Integer lowerAlignerStartNo;
    private Integer lowerAlignerEndNo;

    private Integer stages;
    private Integer wearDaysPerAligner;
    private TreatmentPlanStatus status;
    private Integer currentAlignerNumber;
    private List<AlignerStageResponse> alignerStages;
    private String planningLink;
    private String iprAttachmentChart;
}
