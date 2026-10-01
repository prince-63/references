package com.dentalstack.patient.feature.braces.entity;

import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.enums.AppointmentStatus;
import com.dentalstack.patient.feature.braces.dto.CreateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.dto.UpdateBracesJourneyRequest;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
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

    @OneToMany(mappedBy = "bracesJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<Appointment> appointments = new ArrayList<>();

    private Boolean isTreatmentStarted;

    private LocalDate doctorTreatmentEndDate;

    private LocalDate doctorTreatmentStartDate;

    @OneToMany(targetEntity = Reminder.class, fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "braces_reminder")
    @ToString.Exclude
    private List<Reminder> reminders;

    @OneToMany(mappedBy = "bracesJourney", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<BracesJourneyIssue> bracesJourneyIssues = new ArrayList<>();

    private String upperJawAnchorTypeValue;
    private String lowerJawAnchorTypeValue;
    private LocalDate treatmentStartDate;
    private String extractionRemarks;

    public static @NonNull BracesJourney newTreatment(CreateBracesJourneyRequest request, Patient patient) {
        return BracesJourney.builder()
                .doctorId(request.getDoctorId())
                .patient(patient)
                .treatmentStage(request.getTreatmentStage())
                .tentativeTreatmentDurationInMonths(request.getTentativeTreatmentDurationInMonths())
                .bracketType(request.getBracketType())
                .bracketSelectType(request.getBracketSelectType())
                .bracketSelectSubType(request.getBracketSubType())
                .bracketBrand(request.getBracketBrand())
                .teethExtraction(request.getTeethExtraction())
                .remarks(request.getRemarks())
                .productTypeName(request.getProductTypeName())
                .isTreatmentStarted(false)
                .bracesTreatmentStage(request.getBracesTreatmentStage())
                .treatmentName(request.getTreatmentName())
                .upperJawAnchorTypeValue(request.getUpperJawAnchorTypeValue())
                .lowerJawAnchorTypeValue(request.getLowerJawAnchorTypeValue())
                .treatmentStartDate(request.getTreatmentStartDate())
                .extractionRemarks(request.getExtractionRemarks())
                .build();
    }

    public static BracesJourney updateBracesJourney(UpdateBracesJourneyRequest request, BracesJourney bracesJourney) {
        bracesJourney.setProductTypeName(request.getProductTypeName());
        bracesJourney.setTentativeTreatmentDurationInMonths(request.getTentativeTreatmentDurationInMonths());
        bracesJourney.setBracketType(request.getBracketType());
        bracesJourney.setBracketSelectType(request.getBracketSelectType());
        bracesJourney.setBracketSelectSubType(request.getBracketSubType());
        bracesJourney.setBracketBrand(request.getBracketBrand());
        bracesJourney.setTreatmentStage(request.getTreatmentStatus());
        bracesJourney.setTeethExtraction(request.getTeethExtraction());
        bracesJourney.setRemarks(request.getRemarks());
        bracesJourney.setBracesTreatmentStage(request.getBracesTreatmentStage());
        bracesJourney.setTreatmentName(request.getTreatmentName());
        bracesJourney.setUpperJawAnchorTypeValue(request.getUpperJawAnchorTypeValue());
        bracesJourney.setLowerJawAnchorTypeValue(request.getLowerJawAnchorTypeValue());
        bracesJourney.setTreatmentStartDate(request.getTreatmentStartDate());
        bracesJourney.setExtractionRemarks(request.getExtractionRemarks());

        return bracesJourney;
    }

    public ZonedDateTime getLastAppointmentDate() {
        List<Appointment> appointments = getAppointments();
        if (appointments.isEmpty()) {
            return null;
        }
        return appointments.stream()
                .filter(appointment -> appointment.getStatus() == AppointmentStatus.ACTIVE)
                .map(Appointment::getStartDate)
                .filter(date -> date != null && !date.isAfter(ZonedDateTime.now()))
                .max(Comparator.naturalOrder())
                .orElse(null);
    }

    public Appointment getLastAppointment() {
        List<Appointment> appointments = getAppointments();
        if (appointments.isEmpty()) {
            return null;
        }
        return appointments.stream()
                .filter(appointment -> appointment.getStatus() == AppointmentStatus.ACTIVE)
                .filter(appointment -> appointment.getStartDate() != null
                        && !appointment.getStartDate().isAfter(ZonedDateTime.now()))
                .max(Comparator.comparing(Appointment::getStartDate))
                .orElse(null);
    }

    public Appointment getUpcomingAppointment() {
        List<Appointment> appointments = getAppointments();
        if (appointments.isEmpty()) {
            return null;
        }

        return appointments.stream()
                .filter(appointment -> appointment.getStartDate() != null
                        && appointment.getStartDate().isAfter(ZonedDateTime.now()))
                .min(Comparator.comparing(Appointment::getStartDate))
                .orElse(null);
    }
}
