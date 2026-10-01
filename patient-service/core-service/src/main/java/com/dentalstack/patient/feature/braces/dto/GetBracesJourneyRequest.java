package com.dentalstack.patient.feature.braces.dto;

import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GetBracesJourneyRequest {

    private long doctorId;
    private long organizationId;
    private long profileId;
    private BracesTreatmentStage status;
}
