package com.dentalstack.patient.feature.practice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignPracticeRequest {

    private long patientId;
    private long doctorId;
    private long profileId;
    private long organizationId;
    private long practiceProfileId;
}
