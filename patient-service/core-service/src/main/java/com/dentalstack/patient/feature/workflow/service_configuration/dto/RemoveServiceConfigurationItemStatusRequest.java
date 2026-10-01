package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RemoveServiceConfigurationItemStatusRequest {
    private Long profileId;
    private Long configurationItemId;
}
