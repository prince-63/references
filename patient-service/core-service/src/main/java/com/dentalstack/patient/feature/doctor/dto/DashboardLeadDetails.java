package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.invitation.enums.PatientBelongsTo;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientDetailsMetadata;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import com.dentalstack.patient.feature.patient.enums.LeadTreatmentStage;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.annotation.Nullable;
import java.io.Serializable;
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
public class DashboardLeadDetails implements Serializable {

    private static final long serialVersionUID = 1L;

    private String firstName;
    private String lastName;
    private ProductTypeName productTypes;
    private List<ProductTypeName> productTypeNames;
    private String practiceLocationName;
    private String email;
    private String mobile;
    private Integer age;
    private String gender;
    private String customerMappedId;
    private String services;
    private ZonedDateTime invitedAt;
    private Long patientId;
    private String profileImage;
    private String UUID;
    private String chiefComplaint;
    private CountryCode countryCode;
    private InvitationStatus invitationStatus;
    private PatientStatus patientStatus;
    private long invitationId;
    private String inviteCode;
    private Boolean isInvitationSent;
    private String patientName;
    private String fullName;
    private Long practiceLocationId;
    private String city;
    private String state;
    private String country;
    private Boolean isYourPatient;
    private Boolean isPracticeAssigned;
    private AssignedPractice assignedPractice;

    @Nullable
    private PatientBelongsTo patientBelongsTo;

    private AppInviteStatus appInviteStatus;
    private LeadTreatmentStage treatmentStage;
    private PatientDetailsMetadata patientDetailsMetadata;

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

    public static DashboardLeadDetails from(Invitation invitation) {
        assert invitation.getPatientInvitation() != null;
        var patient = invitation.getPatientInvitation().getPatient();
        return DashboardLeadDetails.builder()
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .fullName(patient.fullName())
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
                .countryCode(patient.getCountryCode())
                .invitationStatus(invitation.getStatus())
                .patientStatus(patient.getPatientStatus())
                .invitationId(invitation.getId())
                .inviteCode(invitation.getInvitationCode().getCode())
                .isInvitationSent(invitation.getIsInvitationSent())
                .patientName(patient.fullName())
                .city(patient.getCity())
                .state(patient.getState())
                .country(patient.getCountry())
                .patientDetailsMetadata(patient.getPatientDetailsMetadata())
                .build();
    }

    public static DashboardLeadDetails from(Patient patient, Invitation invitation) {
        return DashboardLeadDetails.builder()
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .practiceLocationName(patient.getPracticeLocationName())
                .email(patient.getEmail())
                .mobile(patient.getMobileNo())
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomerMappedId())
                .patientId(patient.getId())
                .productTypes(patient.getProductTypeName())
                .productTypeNames(patient.getProductTypeNames())
                .services("")
                .profileImage(patient.getProfilePictureUrl())
                .UUID(patient.getUUID())
                .countryCode(patient.getCountryCode())
                .invitationStatus(invitation.getStatus())
                .patientStatus(patient.getPatientStatus())
                .invitationId(invitation.getId())
                .inviteCode(invitation.getInvitationCode().getCode())
                .isInvitationSent(invitation.getIsInvitationSent())
                .patientName(patient.fullName())
                .city(patient.getCity())
                .state(patient.getState())
                .country(patient.getCountry())
                .patientDetailsMetadata(patient.getPatientDetailsMetadata())
                .build();
    }

    public static DashboardLeadDetails from(Patient patient, Invitation invitation, String chiefComplaint) {
        return DashboardLeadDetails.builder()
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .practiceLocationName(patient.getPracticeLocationName())
                .email(patient.getEmail())
                .age(patient.getAge())
                .gender(patient.getGender())
                .customerMappedId(patient.getCustomerMappedId())
                .mobile(patient.getMobileNo())
                .patientId(patient.getId())
                .productTypes(patient.getProductTypeName())
                .productTypeNames(patient.getProductTypeNames())
                .services("")
                .profileImage(patient.getProfilePictureUrl())
                .UUID(patient.getUUID())
                .chiefComplaint(chiefComplaint)
                .countryCode(patient.getCountryCode())
                .invitationStatus(invitation.getStatus())
                .patientStatus(patient.getPatientStatus())
                .invitationId(invitation.getId())
                .inviteCode(invitation.getInvitationCode().getCode())
                .isInvitationSent(invitation.getIsInvitationSent())
                .patientName(patient.fullName())
                .practiceLocationId(patient.getPracticeLocationId())
                .city(patient.getCity())
                .state(patient.getState())
                .country(patient.getCountry())
                .patientDetailsMetadata(patient.getPatientDetailsMetadata())
                .build();
    }
}
