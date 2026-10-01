package com.dentalstack.patient.feature.workflow.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceProductV2Request {
    private Long ownerProfileId;
    private Long doctorId;
    private Long ownerOrganizationId;
    private Long customerProfileId;
    private Boolean enabledProduct;
    private Boolean defaultProduct;
    private String serviceProductForUser;
}
