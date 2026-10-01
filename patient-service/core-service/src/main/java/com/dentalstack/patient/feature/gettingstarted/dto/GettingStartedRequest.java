package com.dentalstack.patient.feature.gettingstarted.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GettingStartedRequest {
    private Long profileId;
    private Long organizationId;
    private Long doctorId;
}
