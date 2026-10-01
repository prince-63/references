package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceItemRequestDTO {

    @NotBlank(message = "Item name is required")
    private String itemName;

    private String itemDescription;

    private Integer displayOrder;

    @Builder.Default
    private Boolean isActive = true;
}
