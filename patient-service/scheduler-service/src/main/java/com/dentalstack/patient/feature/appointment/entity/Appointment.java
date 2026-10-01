package com.dentalstack.patient.feature.appointment.entity;

import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.storage.entity.DraftFile;
import com.dentalstack.patient.feature.storage.entity.File;
import com.dentalstack.patient.feature.treatment.entity.BracesJourney;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(
        name = "appointment",
        indexes = {
            @Index(name = "IX_braces_appointment_doctor_id", columnList = "doctorId"),
            @Index(name = "IX_braces_appointment_status", columnList = "status"),
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class Appointment extends BaseEntity {
    @Enumerated(EnumType.STRING)
    private ProductTypeName productTypeName;

    private Long doctorId;

    private Double amount;

    private ZonedDateTime startDate;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @JoinTable(name = "braces_appointment_file")
    private List<File> files = new ArrayList<>();

    @OneToMany(targetEntity = DraftFile.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    @JoinTable(name = "braces_appointment_draft_file")
    private Set<DraftFile> draftFiles = new HashSet<>();

    @NotNull
    @ManyToOne
    @JoinColumn(name = "braces_journey_id")
    private BracesJourney bracesJourney;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Jaw> jaws = new ArrayList<>();

    @Nullable
    private ZonedDateTime endDate;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "reminder_id")
    private Reminder reminder;
}
