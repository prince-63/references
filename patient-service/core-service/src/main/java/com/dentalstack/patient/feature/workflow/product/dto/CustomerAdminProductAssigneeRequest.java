package com.dentalstack.patient.feature.workflow.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAdminProductAssigneeRequest {
    private Long productId;
    private Long ownerProfileId;
    private Long assigneeProfileId;
}
