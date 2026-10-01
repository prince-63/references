package com.dentalstack.patient.feature.workflow.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DisableServiceProductRequest {
    private Long ownerProfileId;
    private Long customerProfileId;
    private Long ownerOrganizationId;
    private Long serviceProductId;
}
