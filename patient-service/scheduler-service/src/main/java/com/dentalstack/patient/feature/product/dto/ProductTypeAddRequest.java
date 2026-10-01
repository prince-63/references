package com.dentalstack.patient.feature.product.dto;

import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductTypeAddRequest {

    private ProductTypeName productTypeName;

    private String description;

    private long doctorId;

    private long patientId;
}
