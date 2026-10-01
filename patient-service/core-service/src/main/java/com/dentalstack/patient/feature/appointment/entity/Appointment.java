package com.dentalstack.patient.feature.appointment.entity;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.appointment.dto.CreateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.dto.JawDetails;
import com.dentalstack.patient.feature.appointment.dto.UpdateAppointmentRequest;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.storage.files.entity.File;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.entity.DraftFile;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    @OneToMany(targetEntity = File.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "braces_appointment_file")
    @ToString.Exclude
    private List<File> files = new ArrayList<>();

    @OneToMany(targetEntity = DraftFile.class, cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JoinTable(name = "braces_appointment_draft_file")
    @ToString.Exclude
    private Set<DraftFile> draftFiles = new HashSet<>();

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "braces_journey_id")
    @ToString.Exclude
    private BracesJourney bracesJourney;

    @OneToMany(mappedBy = "appointment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Jaw> jaws = new ArrayList<>();

    @Nullable
    private ZonedDateTime endDate;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "reminder_id")
    private Reminder reminder;

    public static Appointment from(
            CreateAppointmentRequest request, BracesJourney bracesJourney, Patient patient, Reminder reminder) {
        Appointment appointment = Appointment.builder()
                .productTypeName(request.getProductTypeName())
                .amount(request.getAmount())
                .status(request.getStatus())
                .bracesJourney(bracesJourney)
                .doctorId(request.getDoctorId())
                .patient(patient)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reminder(reminder)
                .build();

        List<Jaw> jaws = Jaw.createJaws(request.getJawDetails(), appointment);
        appointment.setJaws(jaws);

        return appointment;
    }

    public void update(UpdateAppointmentRequest request) {
        this.productTypeName = request.getProductTypeName();
        this.amount = request.getAmount();
        this.status = request.getStatus();
        this.startDate = request.getStartDate();
        this.endDate = request.getEndDate();
        updateJaws(request.getJawDetails());
    }

    private void updateJaws(List<JawDetails> jawDetails) {
        if (jawDetails == null || jawDetails.isEmpty()) {
            this.jaws.clear();
            return;
        }

        Set<JawType> updatedJawTypes =
                jawDetails.stream().map(JawDetails::getJawType).collect(Collectors.toSet());

        this.jaws.removeIf(jaw -> !updatedJawTypes.contains(jaw.getJawType()));

        for (JawDetails detail : jawDetails) {
            Jaw jaw = this.jaws.stream()
                    .filter(j -> j.getJawType() == detail.getJawType())
                    .findFirst()
                    .orElseGet(() -> {
                        Jaw newJaw = Jaw.builder()
                                .jawType(detail.getJawType())
                                .appointment(this)
                                .build();
                        this.jaws.add(newJaw);
                        return newJaw;
                    });

            jaw.setMaterialMetaData(new MaterialMetaDataSet(
                    detail.getShape(),
                    detail.getMaterialName(),
                    detail.getMaterialSize(),
                    detail.getSpaceEnclosureTools(),
                    detail.getAccessories(),
                    detail.getTreatmentStageType()));
            jaw.setNote(detail.getNote());
        }
    }
}
