package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.payment.entity.Payment;
import com.dentalstack.patient.feature.payment.enums.Status;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Entity
@Table(
        name = "treatment",
        indexes = {
            @Index(name = "IX_treatment_patient_id", columnList = "patient_id"),
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Treatment extends BaseEntity {
    @NotNull
    private String name;

    private float cost;

    private long doctorId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    @OneToMany(targetEntity = Payment.class, mappedBy = "treatment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(targetEntity = Reminder.class, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "treatment_reminder")
    @ToString.Exclude
    private List<Reminder> reminders;

    public float amountPaid() {
        return (float) payments.stream()
                .filter(payment -> payment.getStatus().equals(Status.ACTIVE))
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    public float balancePayment() {
        return cost - amountPaid();
    }

    public float totalOutstanding() {
        return cost;
    }

    public static Treatment newTreatment(Patient patient, float cost, long doctorId) {
        return Treatment.builder()
                .patient(patient)
                .name("Misc treatment")
                .cost(cost)
                .doctorId(doctorId)
                .build();
    }
}
