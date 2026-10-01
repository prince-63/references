package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.doctor.enums.InvitationStatus;
import com.dentalstack.patient.feature.patient.entity.Invitation;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
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
public class AllInvitationDetailsForMobile {

    @NotNull
    private String firstName;

    private String lastName;

    @Nullable
    private String email;

    @Nullable
    private String mobile;

    @Nullable
    private CountryCode countryCode;

    @Nullable
    private String practiceLocation;

    private ZonedDateTime requestDate;

    private InvitationStatus invitationStatus;

    private long patientId;

    private long invitationId;

    private String patientProfile;

    private LocalDate treatmentStartDate;
    private ProductTypeName productTypeName;
    private List<ProductTypeName> productTypeNames;

    private String uuid;
    private long bracesJourneyId;
    private String chiefComplaint;

    public static AllInvitationDetailsForMobile from(Invitation invitation, Long bracesJourneyId) {

        AllInvitationDetailsForMobile details = new AllInvitationDetailsForMobile();
        assert invitation.getPatientInvitation() != null;
        Patient patient = invitation.getPatientInvitation().getPatient();
        details.setFirstName(patient.getFirstName());
        details.setLastName(patient.getLastName());
        details.setEmail(patient.getEmail());
        details.setMobile(patient.getMobileNo());
        details.setCountryCode(patient.getCountryCode());
        details.setPracticeLocation(patient.getPracticeLocationName());
        details.setRequestDate(invitation.getCreatedAt());
        details.setInvitationStatus(invitation.getStatus());
        details.setInvitationId(invitation.getId());
        details.setPatientProfile(patient.getProfilePictureUrl());
        details.setPatientId(patient.getId());
        details.setProductTypeName(patient.getProductTypeName());
        details.setProductTypeNames(patient.getProductTypeNames());
        details.setUuid(patient.getUUID());
        details.setBracesJourneyId(bracesJourneyId);
        details.setChiefComplaint(patient.getChiefComplaint());

        return details;
    }

    public static AllInvitationDetailsForMobile from(Invitation invitation) {

        AllInvitationDetailsForMobile details = new AllInvitationDetailsForMobile();
        assert invitation.getPatientInvitation() != null;
        Patient patient = invitation.getPatientInvitation().getPatient();
        details.setFirstName(patient.getFirstName());
        details.setLastName(patient.getLastName());
        details.setEmail(patient.getEmail());
        details.setMobile(patient.getMobileNo());
        details.setCountryCode(patient.getCountryCode());
        details.setPracticeLocation(patient.getPracticeLocationName());
        details.setRequestDate(invitation.getCreatedAt());
        details.setInvitationStatus(invitation.getStatus());
        details.setInvitationId(invitation.getId());
        details.setPatientProfile(patient.getProfilePictureUrl());
        details.setPatientId(patient.getId());
        details.setProductTypeName(patient.getProductTypeName());
        details.setProductTypeNames(patient.getProductTypeNames());
        details.setUuid(patient.getUUID());
        details.setChiefComplaint(patient.getChiefComplaint());
        return details;
    }
}
