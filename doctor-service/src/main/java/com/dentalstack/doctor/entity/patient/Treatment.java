package com.dentalstack.doctor.entity.patient;

import com.dentalstack.doctor.entity.BaseEntity;
import com.dentalstack.doctor.entity.reminder.Reminder;
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
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToMany(targetEntity = Payment.class, mappedBy = "treatment", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(targetEntity = Reminder.class, fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "treatment_reminder")
    private List<Reminder> reminders;
}
