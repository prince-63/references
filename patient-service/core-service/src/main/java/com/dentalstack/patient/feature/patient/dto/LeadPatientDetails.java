package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.invitation.projection.WebLeadDetailsSummary;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.enums.LeadTreatmentStage;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
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
public class LeadPatientDetails {
    private String email;
    private String mobile;
    private String fullName;
    private Long patientId;
    private String customPatientId;
    private String practiceLocationName;
    private AppInviteStatus appInviteStatus;
    private String treatmentType;
    private LocalDateTime addedOn;
    private Long practiceLocationId;
    private ListCount listCount;
    private List<String> treatments;
    private LeadTreatmentStage treatmentStage;
    private String profileUrl;
    private String countryCode;
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

    @Builder
    @Data
    public static class ListCount {
        private Long allCount;
        private Long leadCount;
        private Long activeCount;
    }

    public static LeadPatientDetails from(WebLeadDetailsSummary summary) {
        LeadPatientDetails details = LeadPatientDetails.builder()
                .email(summary.getEmail())
                .mobile(summary.getMobileNo())
                .fullName(summary.getFullName().strip())
                .patientId(summary.getPatientId())
                .customPatientId(summary.getCustomerMappedId())
                .practiceLocationName(summary.getPracticeLocationName())
                .practiceLocationId(summary.getPracticeLocationId())
                .treatmentType(summary.getTreatmentType())
                .addedOn(summary.getCreatedAt())
                .appInviteStatus(
                        convertInvitationStatus(summary.getMappedInvitationStatus(), summary.getIsInvitationSent()))
                .treatmentStage(summary.getTreatmentStage())
                .treatments(convertTreatmentStage(summary))
                .profileUrl(summary.getProfilePictureUrl())
                .countryCode(summary.getCountryCode().getCode())
                .patientBelongsTo(summary.getPatientBelongsTo())
                .alignerJourneyId(summary.getAlignerJourneyId())
                .doctorId(summary.getDoctorId())
                .build();

        return details;
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

    private static List<String> convertTreatmentStage(WebLeadDetailsSummary summary) {
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
