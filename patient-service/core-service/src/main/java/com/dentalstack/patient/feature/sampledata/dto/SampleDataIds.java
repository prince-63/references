package com.dentalstack.patient.feature.sampledata.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SampleDataIds {
    private Long patientId;
    private Long doctorId;
    private Long alignerJourneyId;
}
