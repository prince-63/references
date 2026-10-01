package com.dentalstack.patient.feature.treatmenttracking.dto.chat;

import java.util.List;
import lombok.Data;

@Data
public class AlignerReviewRequest {
    private Long patientId;
    private Long alignerStageId;
    private String fitFeedback;
    private String painFeedback;
    private String patientNote;
    private List<Long> photoFileIds;
}
