package com.dentalstack.patient.feature.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignDoctorRequest {
    private Long patientId;
    private Long doctorId;
}
