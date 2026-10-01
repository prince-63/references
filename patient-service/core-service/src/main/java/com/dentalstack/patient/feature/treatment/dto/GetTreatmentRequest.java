package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.enums.TreatmentType;
import com.dentalstack.patient.global.enums.ProductTypeName;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetTreatmentRequest {
    private long id;
    private boolean isTreatmentPlanCreated;
    private boolean isTrackingEnabled;
    private boolean isPatientInvited;
    private TreatmentType treatmentType;
    private ProductTypeName treatmentSubType;
}
