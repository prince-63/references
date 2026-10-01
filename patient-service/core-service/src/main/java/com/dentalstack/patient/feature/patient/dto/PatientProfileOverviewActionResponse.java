package com.dentalstack.patient.feature.patient.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientProfileOverviewActionResponse {
    private Integer pendingActionsCount;
    private List<AlignerData> aligners;
    private PatientProfileOverviewResponse patientProfileOverviewResponse;
}
