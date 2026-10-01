package com.dentalstack.patient.feature.workflow.service_configuration.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceConfigItemResponse {
    private Long itemId;
    private String itemName;
    private Boolean isEnabled;
    private Integer displayOrder;
}
