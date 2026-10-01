package com.dentalstack.patient.feature.billing.entity;

import com.dentalstack.patient.feature.billing.enums.Status;
import com.dentalstack.patient.feature.treatment.entity.Treatment;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.UserType;
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
