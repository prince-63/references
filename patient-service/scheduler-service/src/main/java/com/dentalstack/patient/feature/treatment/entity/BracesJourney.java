package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.treatment.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.treatment.enums.TreatmentStage;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;

@Entity
@Table(
        name = "braces_journey",
        indexes = {
            @Index(name = "IX_braces_journey_patient_id", columnList = "patient_id"),
            @Index(name = "IX_braces_journey_doctor_id", columnList = "doctorId"),
            @Index(name = "IX_braces_journey_treatmentstage", columnList = "bracesTreatmentStage")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class BracesJourney extends BaseEntity {

    private Long doctorId;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Enumerated(EnumType.STRING)
    private TreatmentStage treatmentStage;

    private int tentativeTreatmentDurationInMonths;

    private String bracketType;

    private String bracketSelectType;

    private String bracketSelectSubType;

    private String bracketBrand;

    private List<String> teethExtraction;

    private String remarks;

    @Nullable
    private String treatmentName;

    @Enumerated(EnumType.STRING)
    private ProductTypeName productTypeName;

    @Enumerated(EnumType.STRING)
    private BracesTreatmentStage bracesTreatmentStage;

    @OneToMany(mappedBy = "bracesJourney", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();

    private Boolean isTreatmentStarted;

    private LocalDate doctorTreatmentEndDate;

    private LocalDate doctorTreatmentStartDate;

    @OneToMany(targetEntity = Reminder.class, fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "braces_reminder")
    private List<Reminder> reminders;

    @OneToMany(mappedBy = "bracesJourney", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<BracesJourneyIssue> bracesJourneyIssues = new ArrayList<>();

    private String upperJawAnchorTypeValue;
    private String lowerJawAnchorTypeValue;
    private LocalDate treatmentStartDate;
    private String extractionRemarks;
}
