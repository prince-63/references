package com.dentalstack.patient.feature.order.entity;

import com.dentalstack.patient.feature.order.enums.OrderStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.treatment.entity.Prescription;
import com.dentalstack.patient.feature.treatment.enums.OrderType;
import com.dentalstack.patient.global.entity.NewBaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.*;

@Entity
@Table(
        name = "orders",
        indexes = {
            @Index(name = "idx_order_doctor_profile_org", columnList = "doctorId, profileId, organizationId"),
            @Index(name = "idx_order_doctor_org", columnList = "organizationId, doctorId"),
            @Index(name = "idx_order_patient", columnList = "patient_id")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends NewBaseEntity {
    @NotNull
    private Long doctorId;

    @NotNull
    private Long profileId;

    @NotNull
    private Long organizationId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private Long labId;
    private String labName;

    @Enumerated(EnumType.STRING)
    private OrderType orderType;

    private LocalDate dueBy;
    private Boolean isUrgent;

    @OneToOne()
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private Integer currentStep;

    private String assignedLabUserName;

    private Long assignedLabUserId; // profile_id
}
