package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.aligner.enums.alignertreatment.AlignerTreatmentStatus;
import com.dentalstack.patient.feature.aligner.projection.BracesJourneySummary;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.projection.ActivePatientSummary;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivePatientDetails {
    private String email;
    private String mobile;
    private String fullName;
    private Long patientId;
    private String customPatientId;
    private String practiceLocationName;
    private AppInviteStatus appInviteStatus;
    private String treatmentType;
    private AlignerTreatmentStage treatmentStage;
    private ZonedDateTime addedOn;
    private Long practiceLocationId;
    private List<String> treatments;
    private CountryCode countryCode;
    private String profileUrl;
    private PatientBelongsTo patientBelongsTo;
    private Long alignerJourneyId;
    private Boolean isYourPatient;
    private Long doctorId;
    private AssignedPractice assignedPractice;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AssignedPractice {
        private Long practiceDoctorId;
        private Long practiceProfileId;
        private Long practiceOrganizationId;
        private String name;
    }

    public static ActivePatientDetails from(BracesJourneySummary bracesJourney) {
        return ActivePatientDetails.builder()
                .email(bracesJourney.getEmail())
                .mobile(bracesJourney.getMobile())
                .fullName(bracesJourney.getFullName().strip())
                .patientId(bracesJourney.getPatientId())
                .customPatientId(bracesJourney.getCustomPatientId())
                .practiceLocationName(bracesJourney.getPracticeLocationName())
                .practiceLocationId(bracesJourney.getPracticeLocationId())
                .treatmentType(bracesJourney.getTreatmentType())
                .addedOn(bracesJourney.getCreatedAt())
                .treatmentStage(AlignerTreatmentStage.ONGOING)
                .appInviteStatus(convertInvitationStatus(
                        bracesJourney.getInvitationStatus(), bracesJourney.getIsInvitationSent()))
                .treatments(new ArrayList<>(List.of(ProductTypeName.BRACES.name())))
                .countryCode(bracesJourney.getCountryCode())
                .build();
    }

    public static ActivePatientDetails from(ActivePatientSummary patient) {
        ActivePatientDetails patientDetails = ActivePatientDetails.builder()
                .email(patient.getEmail())
                .mobile(patient.getMobile())
                .fullName(patient.getFullName().strip())
                .patientId(patient.getPatientId())
                .customPatientId(patient.getCustomPatientId())
                .practiceLocationName(patient.getPracticeLocationName())
                .practiceLocationId(patient.getPracticeLocationId())
                .treatmentType(patient.getTreatmentType())
                .addedOn(patient.getAddedOn().atZone(ZoneId.systemDefault()))
                .appInviteStatus(
                        convertInvitationStatus(patient.getMappedInvitationStatus(), patient.getIsInvitationSent()))
                .treatmentStage(
                        determineTreatmentStatus(patient.getTrackingStatus(), patient.getDoctorTreatmentStartDate()))
                .treatments(convertTreatmentStage(patient))
                .countryCode(patient.getCountryCode())
                .profileUrl(patient.getProfilePictureUrl())
                .patientBelongsTo(patient.getPatientBelongsTo())
                .alignerJourneyId(patient.getAlignerJourneyId())
                .doctorId(patient.getDoctorId())
                .build();

        if (patient.getBrandName() != null) {
            String[] treatments = patient.getBrandName().split(",");
            patientDetails.setTreatments(Arrays.asList(treatments));
        } else {
            patientDetails.setTreatments(Arrays.asList(ProductTypeName.BRACES.name()));
        }

        return patientDetails;
    }

    private static AppInviteStatus convertInvitationStatus(InvitationStatus status, Boolean isInvitationSent) {
        if (status == null || isInvitationSent == null) {
            return AppInviteStatus.NOT_CONNECTED;
        } else if (status.equals(InvitationStatus.ACCEPTED)) {
            return AppInviteStatus.CONNECTED;
        } else if (status.equals(InvitationStatus.SENT) && isInvitationSent) {
            return AppInviteStatus.PENDING;
        } else {
            return AppInviteStatus.NOT_CONNECTED;
        }
    }

    private static AlignerTreatmentStage determineTreatmentStatus(
            AlignerTreatmentStatus status, LocalDate treatmentStartDate) {

        if (status == null) {
            return null;
        }

        return switch (status) {
            case ACTIVE -> treatmentStartDate.isAfter(LocalDate.now())
                    ? AlignerTreatmentStage.STARTING_SOON
                    : AlignerTreatmentStage.ONGOING;
            case DEACTIVATED -> AlignerTreatmentStage.REFINEMENT;
            case PAUSED -> AlignerTreatmentStage.PAUSED;
            default -> null;
        };
    }

    private static List<String> convertTreatmentStage(ActivePatientSummary summary) {
        if (summary.getRawProductTypeNames().contains(ProductTypeName.ALIGNERS.name())
                || summary.getRawProductTypeNames().contains(ProductTypeName.BRACES.name())) {
            if (summary.getBrandName() != null) {
                String[] treatments = summary.getBrandName().split(",");
                return Arrays.asList(treatments);
            } else if (summary.getTreatmentPlanId() != null) {
                return List.of(ProductTypeName.ALIGNERS.name());
            } else {
                return List.of(ProductTypeName.BRACES.name());
            }
        }
        return List.of(ProductTypeName.UNASSIGNED.name());
    }
}
