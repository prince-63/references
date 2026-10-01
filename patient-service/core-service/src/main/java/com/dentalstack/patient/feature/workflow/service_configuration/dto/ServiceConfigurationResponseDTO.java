package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceConfigurationResponseDTO {

    private Long id;
    private Long profileId;
    private List<ServiceItemResponseDTO> enabledItems;
    private List<ServiceItemResponseDTO> disabledItems;
}
