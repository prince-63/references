package com.dentalstack.patient.feature.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardCounts {
    private String activePatientCount;

    private Long practiceLocationCount;

    private Long activePatient;

    private Long totalPatient;

    private Long newActivePatient;

    private int totalNewPatient;
}
