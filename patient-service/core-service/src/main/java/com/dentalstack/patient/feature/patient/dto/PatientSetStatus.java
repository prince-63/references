package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSetStatus {

    private Long patientId;

    private PatientStatus patientStatus;
}
