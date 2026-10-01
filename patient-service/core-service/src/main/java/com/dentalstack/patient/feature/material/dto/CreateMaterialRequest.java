package com.dentalstack.patient.feature.material.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateMaterialRequest {

    private Long id;

    private long doctorId;

    private String materialName;
}
