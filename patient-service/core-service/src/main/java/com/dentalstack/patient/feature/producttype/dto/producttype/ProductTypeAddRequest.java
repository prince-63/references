package com.dentalstack.patient.feature.producttype.dto.producttype;

import com.dentalstack.patient.global.enums.ProductTypeName;
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
