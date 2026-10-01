package com.dentalstack.doctor.entity.patient;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.enums.patient.UserType;
import com.dentalstack.doctor.enums.patient.payments.Status;
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

    @ManyToOne
    @JoinColumn(name = "treatment_id")
    private Treatment treatment;
}
