package com.dentalstack.patient.feature.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerDetailsForDoctor {
    private boolean inFutureTreatment;
    private int currentAligner;
    private boolean isTreatmentFilled;
    private String brandName;
}
