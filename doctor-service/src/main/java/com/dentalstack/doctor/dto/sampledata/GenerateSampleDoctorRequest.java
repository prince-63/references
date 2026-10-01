package com.dentalstack.doctor.dto.sampledata;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GenerateSampleDoctorRequest {
    private Long patientId;
    private Long alignerJourneyId;
}
