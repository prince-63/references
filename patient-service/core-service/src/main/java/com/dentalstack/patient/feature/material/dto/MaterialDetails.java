package com.dentalstack.patient.feature.material.dto;

import com.dentalstack.patient.feature.appointment.enums.MaterialEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MaterialDetails {

    private MaterialEnum material;

    private String materialName;

    private Long doctorId;

    private Boolean isCommon;
}
