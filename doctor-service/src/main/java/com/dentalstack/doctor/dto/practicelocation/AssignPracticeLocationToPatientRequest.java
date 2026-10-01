package com.dentalstack.doctor.dto.practicelocation;

import lombok.Data;

@Data
public class AssignPracticeLocationToPatientRequest {

    private Long patientId;

    private Long practiceLocationId;

    private Long userId;

    private Long treatmentTypeId;
}
