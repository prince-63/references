package com.dentalstack.patient.feature.producttype.dto.product;

import com.dentalstack.patient.global.enums.ProductTypeName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductRequest {

    private ProductTypeName productTypeName;

    private String description;
}
