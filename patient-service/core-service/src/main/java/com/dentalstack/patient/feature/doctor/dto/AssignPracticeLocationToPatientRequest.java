package com.dentalstack.patient.feature.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AssignPracticeLocationToPatientRequest {

    private Long patientId;

    private Long practiceLocationId;

    private Long userId;

    public static AssignPracticeLocationToPatientRequest from(Long patientId, Long practiceLocationId, Long doctorId) {
        return AssignPracticeLocationToPatientRequest.builder()
                .patientId(patientId)
                .practiceLocationId(practiceLocationId)
                .userId(doctorId)
                .build();
    }
}
