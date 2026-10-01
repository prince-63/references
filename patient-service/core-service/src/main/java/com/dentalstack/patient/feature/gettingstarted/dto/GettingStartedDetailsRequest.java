package com.dentalstack.patient.feature.gettingstarted.dto;

import com.dentalstack.patient.feature.gettingstarted.enums.GettingStartedFilter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GettingStartedDetailsRequest {
    private Long doctorId;
    private Long organizationId;
    private Long profileId;
    private Long patientId;
    private GettingStartedFilter filterByStep;
}
