package com.dentalstack.patient.feature.braces.dto;

import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FilterBracesJourneysRequest {

    private Long doctorId;

    private Long patientId;

    private BracesTreatmentStage bracesTreatmentStage;
}
