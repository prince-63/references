package com.dentalstack.patient.feature.dailywins.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDailyWinsRequest {
    private Long patientId;
    private String code;
}
