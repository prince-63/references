package com.dentalstack.patient.feature.treatment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TreatmentPlan {

    private String doctorFirstName;
    private String doctorLastName;
    private long patientCount;
    private long practiceLocationCount;
    private long userNotAssignedToTreatmentCount;
    private long userNotAssignedToTreatmentPlanCount;
    private long userNotAssignedToAppointmentCount;
}
