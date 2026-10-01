package com.dentalstack.patient.feature.payment.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdatePaymentRequest {
    private long patientId;
    private long doctorId;
    private long paymentId;

    @NotNull
    private String name;

    private float amount;

    @NotNull
    private LocalDate date;
}
