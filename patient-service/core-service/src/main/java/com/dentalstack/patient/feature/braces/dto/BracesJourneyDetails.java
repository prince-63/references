package com.dentalstack.patient.feature.braces.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.TreatmentStage;
import com.dentalstack.patient.feature.appointment.dto.AppointmentDetails;
import com.dentalstack.patient.feature.appointment.dto.JawDetails;
import com.dentalstack.patient.feature.appointment.dto.reminder.CustomAppointmentReminderResponse;
import com.dentalstack.patient.feature.appointment.entity.Appointment;
import com.dentalstack.patient.feature.appointment.entity.Jaw;
import com.dentalstack.patient.feature.braces.entity.BracesJourney;
import com.dentalstack.patient.feature.braces.enums.BracesTreatmentStage;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Nullable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BracesJourneyDetails {

    private Long doctorId;
    private Long patientId;
    private int tentativeTreatmentDurationInMonths;
    private String bracketType;
    private String bracketSelectType;
    private String bracketSelectSubType;
    private String bracketBrand;
    private BracesTreatmentStage bracesTreatmentStage;
    private List<String> teethExtraction;
    private String remarks;
    private LocalDate nextAppointmentDate;
    private long bracesJourneyId;
    private LocalDate previousAppointmentDate;
    private String email;
    private String mobile;
    private String firstName;
    private String lastName;
    private String uuid;
    private TreatmentStage treatmentStage;
    private ProductTypeName productTypeName;
    private boolean isReminderFilled;
    private boolean isAppointmentFilled;
    private String chiefComplaint;
    private String treatmentName;
    private ZonedDateTime treatmentCreatedAt;
    private String practiceLocationName;
    private CountryCode countryCode;
    private String appointmentLastTreatmentStage;
    private AppointmentDetails lastAppointmentDetails;
    private String patientName;

    private String upperJawAnchorTypeValue;
    private String lowerJawAnchorTypeValue;
    private LocalDate treatmentStartDate;
    private String extractionRemarks;
    private String patientProfileUrl;

    private CustomAppointmentReminderResponse upcomingAppointmentReminderDetails;

    @Builder.Default
    private List<JawDetails> jaws = new ArrayList<>();

    public static BracesJourneyDetails from(BracesJourney bracesJourney) {
        return BracesJourneyDetails.builder()
                .bracesJourneyId((bracesJourney.getId()))
                .treatmentStage(bracesJourney.getTreatmentStage())
                .doctorId(bracesJourney.getDoctorId())
                .patientId(bracesJourney.getPatient().getId())
                .productTypeName(bracesJourney.getProductTypeName())
                .tentativeTreatmentDurationInMonths(bracesJourney.getTentativeTreatmentDurationInMonths())
                .bracketType(bracesJourney.getBracketType())
                .bracketSelectType(bracesJourney.getBracketSelectType())
                .bracketSelectSubType(bracesJourney.getBracketSelectSubType())
                .bracketBrand(bracesJourney.getBracketBrand())
                .bracesTreatmentStage(bracesJourney.getBracesTreatmentStage())
                .teethExtraction(bracesJourney.getTeethExtraction())
                .remarks(bracesJourney.getRemarks())
                .firstName(bracesJourney.getPatient().getFirstName())
                .lastName(bracesJourney.getPatient().getLastName())
                .email(bracesJourney.getPatient().getEmail())
                .mobile(bracesJourney.getPatient().getMobileNo())
                .countryCode(bracesJourney.getPatient().getCountryCode())
                .uuid(bracesJourney.getPatient().getUUID())
                .chiefComplaint(bracesJourney.getPatient().getChiefComplaint())
                .treatmentName(bracesJourney.getTreatmentName())
                .treatmentCreatedAt(bracesJourney.getCreatedAt())
                .practiceLocationName(bracesJourney.getPatient().getPracticeLocationName())
                .countryCode(bracesJourney.getPatient().getCountryCode())
                .patientName(bracesJourney.getPatient().fullName())
                .extractionRemarks(bracesJourney.getExtractionRemarks())
                .upperJawAnchorTypeValue(bracesJourney.getUpperJawAnchorTypeValue())
                .lowerJawAnchorTypeValue(bracesJourney.getLowerJawAnchorTypeValue())
                .treatmentStartDate(bracesJourney.getTreatmentStartDate())
                .patientProfileUrl(bracesJourney.getPatient().getProfilePictureUrl())
                .build();
    }

    public static BracesJourneyDetails from(
            BracesJourney bracesJourney,
            LocalDate nextAppointmentDate,
            @Nullable Appointment previousAppointment,
            boolean isAppointmentFilled,
            boolean isReminderFilled) {

        String appointmentLastTreatmentStage = null;
        if (previousAppointment != null && !previousAppointment.getJaws().isEmpty()) {
            Jaw firstJaw = previousAppointment.getJaws().get(0);
            if (firstJaw.getMaterialMetaData() != null) {
                appointmentLastTreatmentStage = firstJaw.getMaterialMetaData().getTreatmentStageType();
            }
        }
        return BracesJourneyDetails.builder()
                .bracesJourneyId((bracesJourney.getId()))
                .doctorId(bracesJourney.getDoctorId())
                .patientId(bracesJourney.getPatient().getId())
                .bracesTreatmentStage(bracesJourney.getBracesTreatmentStage())
                .treatmentStage(bracesJourney.getTreatmentStage())
                .productTypeName(bracesJourney.getProductTypeName())
                .treatmentStage(bracesJourney.getTreatmentStage())
                .tentativeTreatmentDurationInMonths(bracesJourney.getTentativeTreatmentDurationInMonths())
                .bracketType(bracesJourney.getBracketType())
                .bracketSelectType(bracesJourney.getBracketSelectType())
                .bracketSelectSubType(bracesJourney.getBracketSelectSubType())
                .bracketBrand(bracesJourney.getBracketBrand())
                .teethExtraction(bracesJourney.getTeethExtraction())
                .remarks(bracesJourney.getRemarks())
                .firstName(bracesJourney.getPatient().getFirstName())
                .lastName(bracesJourney.getPatient().getLastName())
                .email(bracesJourney.getPatient().getEmail())
                .mobile(bracesJourney.getPatient().getMobileNo())
                .countryCode(bracesJourney.getPatient().getCountryCode())
                .uuid(bracesJourney.getPatient().getUUID())
                .nextAppointmentDate(nextAppointmentDate)
                .isAppointmentFilled(isAppointmentFilled)
                .isReminderFilled(isReminderFilled)
                .chiefComplaint(bracesJourney.getPatient().getChiefComplaint())
                .treatmentName(bracesJourney.getTreatmentName())
                .treatmentCreatedAt(bracesJourney.getCreatedAt())
                .practiceLocationName(bracesJourney.getPatient().getPracticeLocationName())
                .countryCode(bracesJourney.getPatient().getCountryCode())
                .previousAppointmentDate(
                        previousAppointment != null ? LocalDate.from(previousAppointment.getStartDate()) : null)
                .lastAppointmentDetails(
                        previousAppointment != null ? AppointmentDetails.from(previousAppointment) : null)
                .appointmentLastTreatmentStage(appointmentLastTreatmentStage)
                .patientName(bracesJourney.getPatient().fullName())
                .extractionRemarks(bracesJourney.getExtractionRemarks())
                .upperJawAnchorTypeValue(bracesJourney.getUpperJawAnchorTypeValue())
                .lowerJawAnchorTypeValue(bracesJourney.getLowerJawAnchorTypeValue())
                .treatmentStartDate(bracesJourney.getTreatmentStartDate())
                .jaws(
                        previousAppointment != null && previousAppointment.getJaws() != null
                                ? previousAppointment.getJaws().stream()
                                        .map(JawDetails::from)
                                        .toList()
                                : null)
                .patientProfileUrl(bracesJourney.getPatient().getProfilePictureUrl())
                .build();
    }

    public static BracesJourneyDetails from(
            BracesJourney bracesJourney,
            LocalDate nextAppointmentDate,
            @Nullable Appointment previousAppointment,
            boolean isAppointmentFilled,
            boolean isReminderFilled,
            CustomAppointmentReminderResponse pastAppointmentReminderDetails,
            CustomAppointmentReminderResponse upcomingAppointmentReminderDetails) {

        String appointmentLastTreatmentStage = null;
        if (previousAppointment != null && !previousAppointment.getJaws().isEmpty()) {
            Jaw firstJaw = previousAppointment.getJaws().get(0);
            if (firstJaw.getMaterialMetaData() != null) {
                appointmentLastTreatmentStage = firstJaw.getMaterialMetaData().getTreatmentStageType();
            }
        }
        AppointmentDetails lastAppointmentDetails =
                (previousAppointment == null && pastAppointmentReminderDetails == null)
                        ? null
                        : AppointmentDetails.from(previousAppointment, pastAppointmentReminderDetails);

        return BracesJourneyDetails.builder()
                .bracesJourneyId((bracesJourney.getId()))
                .doctorId(bracesJourney.getDoctorId())
                .patientId(bracesJourney.getPatient().getId())
                .bracesTreatmentStage(bracesJourney.getBracesTreatmentStage())
                .treatmentStage(bracesJourney.getTreatmentStage())
                .productTypeName(bracesJourney.getProductTypeName())
                .treatmentStage(bracesJourney.getTreatmentStage())
                .tentativeTreatmentDurationInMonths(bracesJourney.getTentativeTreatmentDurationInMonths())
                .bracketType(bracesJourney.getBracketType())
                .bracketSelectType(bracesJourney.getBracketSelectType())
                .bracketSelectSubType(bracesJourney.getBracketSelectSubType())
                .bracketBrand(bracesJourney.getBracketBrand())
                .teethExtraction(bracesJourney.getTeethExtraction())
                .remarks(bracesJourney.getRemarks())
                .firstName(bracesJourney.getPatient().getFirstName())
                .lastName(bracesJourney.getPatient().getLastName())
                .email(bracesJourney.getPatient().getEmail())
                .mobile(bracesJourney.getPatient().getMobileNo())
                .countryCode(bracesJourney.getPatient().getCountryCode())
                .uuid(bracesJourney.getPatient().getUUID())
                .nextAppointmentDate(nextAppointmentDate)
                .isAppointmentFilled(isAppointmentFilled)
                .isReminderFilled(isReminderFilled)
                .chiefComplaint(bracesJourney.getPatient().getChiefComplaint())
                .treatmentName(bracesJourney.getTreatmentName())
                .treatmentCreatedAt(bracesJourney.getCreatedAt())
                .practiceLocationName(bracesJourney.getPatient().getPracticeLocationName())
                .countryCode(bracesJourney.getPatient().getCountryCode())
                .previousAppointmentDate(
                        previousAppointment != null ? LocalDate.from(previousAppointment.getStartDate()) : null)
                .lastAppointmentDetails(lastAppointmentDetails)
                .appointmentLastTreatmentStage(appointmentLastTreatmentStage)
                .patientName(bracesJourney.getPatient().fullName())
                .extractionRemarks(bracesJourney.getExtractionRemarks())
                .upperJawAnchorTypeValue(bracesJourney.getUpperJawAnchorTypeValue())
                .lowerJawAnchorTypeValue(bracesJourney.getLowerJawAnchorTypeValue())
                .treatmentStartDate(bracesJourney.getTreatmentStartDate())
                .jaws(
                        previousAppointment != null && previousAppointment.getJaws() != null
                                ? previousAppointment.getJaws().stream()
                                        .map(JawDetails::from)
                                        .toList()
                                : null)
                .patientProfileUrl(bracesJourney.getPatient().getProfilePictureUrl())
                .upcomingAppointmentReminderDetails(upcomingAppointmentReminderDetails)
                .build();
    }
}
