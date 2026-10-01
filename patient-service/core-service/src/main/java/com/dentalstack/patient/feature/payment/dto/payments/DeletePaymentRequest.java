package com.dentalstack.patient.feature.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeletePaymentRequest {
    private long patientId;
    private long doctorId;

    private long paymentId;
}
