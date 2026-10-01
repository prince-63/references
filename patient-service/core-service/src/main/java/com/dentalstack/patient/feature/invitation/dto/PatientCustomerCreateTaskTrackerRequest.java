package com.dentalstack.patient.feature.invitation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientCustomerCreateTaskTrackerRequest {
    private Long practiceProfileId;
    private Long patientId;
    private Long parentTaskTrackerId;
}
