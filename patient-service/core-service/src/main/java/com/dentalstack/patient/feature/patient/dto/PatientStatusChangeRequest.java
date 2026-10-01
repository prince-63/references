package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.tracking.enums.PatientTrackingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientStatusChangeRequest {

    private PatientTrackingStatus patientTrackingStatus;

    private long treatmentPlanId;
}
