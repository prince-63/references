package com.dentalstack.patient.feature.material.dto;

import com.dentalstack.patient.feature.appointment.enums.MaterialEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaterialAddRequest {

    private long doctorId;

    private MaterialEnum material;

    private String materialDetails;

    private Boolean isCommon;
}
