package com.dentalstack.patient.feature.workflow.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DefaultServiceProductRequest {
    private Long profileId;
    private String serviceProductFor;
}
