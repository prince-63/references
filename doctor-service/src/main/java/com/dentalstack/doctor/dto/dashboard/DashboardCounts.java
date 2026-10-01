package com.dentalstack.doctor.dto.dashboard;

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

    private long newActivePatient;

    private int totalNewPatient;
}
