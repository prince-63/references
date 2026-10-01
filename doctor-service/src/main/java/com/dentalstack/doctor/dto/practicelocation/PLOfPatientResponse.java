package com.dentalstack.doctor.dto.practicelocation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PLOfPatientResponse {

    private Long patientId;
    private String practiceLocationName;
    private Long practiceLocationId;
}
