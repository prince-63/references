package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import java.time.ZonedDateTime;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceConfigurationResponse {
    private Long configId;
    private String configName;
    private List<ServiceConfigItemResponse> configItems;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
