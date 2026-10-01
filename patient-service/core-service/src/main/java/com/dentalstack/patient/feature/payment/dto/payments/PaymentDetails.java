package com.dentalstack.patient.feature.payment.dto.payments;

import com.dentalstack.patient.feature.payment.entity.Payment;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDetails {
    private long paymentId;
    private float amount;
    private String name;

    @Deprecated
    private ZonedDateTime createdAt;

    private LocalDate date;

    public static PaymentDetails from(Payment payment) {
        return new PaymentDetails(
                payment.getId(),
                payment.getAmount(),
                payment.getPaymentName(),
                payment.getCreatedAt(),
                payment.getDate());
    }
}
