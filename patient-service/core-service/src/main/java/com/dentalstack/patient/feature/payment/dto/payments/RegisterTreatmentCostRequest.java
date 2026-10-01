package com.dentalstack.patient.feature.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterTreatmentCostRequest {
    private long doctorId;

    private long patientId;

    private float cost;
}
