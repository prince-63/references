package com.dentalstack.patient.feature.payment.entity;

import com.dentalstack.patient.feature.payment.dto.RegisterPaymentRequest;
import com.dentalstack.patient.feature.payment.enums.Status;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(name = "payment")
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity {

    private long fromUserId;

    @Enumerated(EnumType.STRING)
    private UserType fromUserType;

    private long toUserId;

    @Enumerated(EnumType.STRING)
    private UserType toUserType;

    private String paymentName;

    private float amount;

    @NonNull
    private LocalDate date;

    private Status status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_id")
    @ToString.Exclude
    private Treatment treatment;

    public static Payment fromPatient(Treatment treatment, RegisterPaymentRequest request) {
        return new Payment(
                request.getPatientId(),
                UserType.PATIENT,
                request.getDoctorId(),
                UserType.DOCTOR,
                request.getName(),
                request.getAmount(),
                request.getDate(),
                Status.ACTIVE,
                treatment);
    }
}
