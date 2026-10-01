package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.patient.entity.PatientDetailsMetadata;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchivedLeadDetails {

    private String firstName;
    private String lastName;
    private List<ProductTypeName> productTypeNames;
    private ProductTypeName productTypes;
    private String practiceLocationName;
    private String email;
    private String mobile;
    private String services;
    private ZonedDateTime invitedAt;
    private Long patientId;
    private String profileImage;
    private String UUID;
    private String chiefComplaint;
    private ZonedDateTime archivedAt;
    private CountryCode countryCode;
    private PatientStatus patientStatus;
    private String patientName;
    private PatientOverviewDetails.AssignedPractice assignedPractice;
    private Boolean isYourPatient;
    private PaginationDetails paginationDetails;
    private PatientDetailsMetadata patientDetailsMetadata;

    @Builder
    @Data
    public static class PaginationDetails {
        private int pageNumber;
        private int pageSize;
        private long totalOrders;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    public static ArchivedLeadDetails from(Invitation invitation) {
        assert invitation.getPatientInvitation() != null;
        var patient = invitation.getPatientInvitation().getPatient();
        return ArchivedLeadDetails.builder()
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .practiceLocationName(patient.getPracticeLocationName())
                .email(patient.getEmail())
                .mobile(patient.getMobileNo())
                .invitedAt(invitation.getCreatedAt())
                .patientId(patient.getId())
                .productTypes(patient.getProductTypeName())
                .productTypeNames(patient.getProductTypeNames())
                .services("")
                .profileImage(patient.getProfilePictureUrl())
                .UUID(patient.getUUID())
                .chiefComplaint(patient.getChiefComplaint())
                .archivedAt(patient.getArchivedAt())
                .countryCode(patient.getCountryCode())
                .patientStatus(patient.getPatientStatus())
                .patientName(patient.fullName())
                .assignedPractice(PatientOverviewDetails.AssignedPractice.builder()
                        .practiceDoctorId(
                                patient.getDoctorOrganization().getDoctor().getId())
                        .practiceProfileId(
                                patient.getDoctorOrganization().getUserProfile().getId())
                        .practiceOrganizationId(patient.getDoctorOrganization()
                                .getOrganization()
                                .getId())
                        .name(patient.getDoctorOrganization()
                                .getUserProfile()
                                .getUser()
                                .displayName())
                        .build())
                .build();
    }

    public static ArchivedLeadDetails from(
            PatientSummary patient, Long profileId, PaginationDetails paginationDetails) {
        return ArchivedLeadDetails.builder()
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .practiceLocationName(patient.getPracticeLocationName())
                .email(patient.getEmail())
                .mobile(patient.getMobileNumber())
                .invitedAt(patient.getCreatedAt())
                .patientId(patient.getPatientId())
                .productTypes(patient.getProductType())
                .productTypeNames(patient.getProductTypeNames())
                .services("")
                .profileImage(patient.getProfilePictureUrl())
                .UUID(patient.getUuid())
                .chiefComplaint(patient.getChiefComplaint())
                .archivedAt(patient.getArchivedAt())
                .countryCode(patient.getCountryCode())
                .patientStatus(patient.getPatientStatus())
                .patientName(fullName(patient.getFirstName(), patient.getLastName()))
                .isYourPatient(patient.getPracticeProfileId().equals(profileId))
                .assignedPractice(PatientOverviewDetails.AssignedPractice.builder()
                        .practiceDoctorId(patient.getPracticeDoctorId())
                        .practiceProfileId(patient.getPracticeProfileId())
                        .practiceOrganizationId(patient.getPracticeOrganizationId())
                        .name(patient.getPracticeName())
                        .build())
                .paginationDetails(paginationDetails)
                .build();
    }

    public static String fullName(String firstName, String lastName) {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }
}
