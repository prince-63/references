package com.dentalstack.patient.feature.material.dto;

import com.dentalstack.patient.feature.material.enums.MaterialToolType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AddMaterialTool {

    private String materialName;

    private MaterialToolType materialToolType;

    private Long doctorId;
}
