package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.projection.CombinedPatientSummary;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AssignedPractice {
    private Long practiceDoctorId;
    private Long practiceProfileId;
    private Long practiceOrganizationId;
    private String practiceName;

    public static AssignedPractice from(CombinedPatientSummary patient) {
        return AssignedPractice.builder()
                .practiceDoctorId(patient.getPracticeDoctorId())
                .practiceProfileId(patient.getPracticeProfileId())
                .practiceOrganizationId(patient.getPracticeOrganizationId())
                .practiceName(patient.getPracticeName())
                .build();
    }
}
