package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.AlignerTreatmentStage;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.projection.CombinedPatientSummary;
import com.dentalstack.patient.feature.user.entity.User;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
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
public class CombinedPatientDetails {
    private Integer age;
    private String gender;
    private String email;
    private String mobile;
    private String fullName;
    private Long profilePictureId;
    private Long patientId;
    private String customPatientId;
    private String practiceLocationName;
    private AppInviteStatus appInviteStatus;
    private String treatmentType;
    private AlignerTreatmentStage treatmentStage;
    private LocalDateTime addedOn;
    private Long practiceLocationId;
    private List<String> treatments;
    private String profileUrl;
    private String countryCode;
    private PatientBelongsTo patientBelongsTo;
    private Long alignerJourneyId;
    private Boolean isYourPatient;
    private Long doctorId;
    private AssignedPractice assignedPractice;
    private LocalDateTime archivedOn;
    private String createdBy;
    private String createdByImage;
    private ZonedDateTime updatedAt;
    private Long currentStep;

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
        private Long orderCount;
        private String customerName;
    }

    public static CombinedPatientDetails fromSimplified(CombinedPatientSummary patient) {
        List<String> treatments = new ArrayList<>();

        String fullName = patient.getLastName() != null
                ? patient.getFirstName() + " " + patient.getLastName()
                : patient.getFirstName();

        return CombinedPatientDetails.builder()
                .age(patient.getAge())
                .gender(patient.getGender())
                .email(patient.getEmail())
                .mobile(patient.getMobile())
                .fullName(fullName.strip())
                .profilePictureId(patient.getProfilePictureId())
                .patientId(patient.getPatientId())
                .customPatientId(patient.getCustomPatientId())
                .practiceLocationName(patient.getPracticeLocationName())
                .practiceLocationId(patient.getPracticeLocationId())
                .addedOn(patient.getCreatedAt())
                .appInviteStatus(
                        convertInvitationStatus(patient.getMappedInvitationStatus(), patient.getIsInvitationSent()))
                .treatmentStage(patient.getTreatmentStage())
                .treatments(convertTreatmentStage(patient))
                .countryCode(patient.getCountryCode().getCode())
                .profileUrl(patient.getProfilePictureUrl())
                .patientBelongsTo(patient.getPatientBelongsTo())
                .alignerJourneyId(patient.getAlignerJourneyId())
                .doctorId(patient.getDoctorId())
                .treatmentType(patient.getTreatmentType())
                .archivedOn(patient.getArchivedAt())
                .createdBy(User.getFullNameWithSalutation(
                        patient.getAddedBySalutation(), patient.getAddedByFirstName(), patient.getAddedByLastName()))
                .createdByImage(patient.getAddedByUserProfileUrl())
                .currentStep(patient.getCurrentStep())
                .build();
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

    private static List<String> convertTreatmentStage(CombinedPatientSummary summary) {
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
