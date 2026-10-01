package com.dentalstack.patient.feature.patient.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientGetRequest {
    private Long doctorId;
    private Long organizationId;
    private Long profileId;
    private Long patientId;
}
