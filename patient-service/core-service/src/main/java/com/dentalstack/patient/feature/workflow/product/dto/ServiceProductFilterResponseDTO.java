package com.dentalstack.patient.feature.workflow.product.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ServiceProductFilterResponseDTO {
    private List<ServiceProductResponse> ownerProducts;
    private List<ServiceProductResponse> vendorProducts;
}
