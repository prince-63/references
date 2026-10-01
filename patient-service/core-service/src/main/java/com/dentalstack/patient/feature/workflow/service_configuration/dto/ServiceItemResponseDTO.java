package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceItemResponseDTO {
    private Long id;
    private String itemName;
    private Integer displayOrder;
    private Boolean isActive;
}
