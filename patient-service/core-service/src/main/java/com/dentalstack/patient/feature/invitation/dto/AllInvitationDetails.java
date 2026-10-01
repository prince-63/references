package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllInvitationDetails {

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

    private String inviteCode;

    private ZonedDateTime requestDate;

    private boolean isTreatmentFilled;

    private InvitationStatus invitationStatus;

    private long patientId;

    private long invitationId;

    private String patientProfile;
    private String statusList;
    private String invitationCode;

    private boolean inviteSent;
    private long alignerJourneyID;
    private LocalDate treatmentStartDate;

    private ProductTypeName productTypeName;

    public static AllInvitationDetails from(
            Invitation invitation, boolean isTreatmentFilled, AlignerJourney alignerJourney) {

        AllInvitationDetails details = new AllInvitationDetails();
        assert invitation.getPatientInvitation() != null;
        var sentCount = invitation.getSentCount();
        var inviteDate = invitation.getResentInviteAt();
        Patient patient = invitation.getPatientInvitation().getPatient();
        details.setFirstName(patient.getFirstName());
        details.setLastName(patient.getLastName());
        details.setEmail(patient.getEmail());
        details.setMobile(patient.getMobileNo());
        details.setCountryCode(patient.getCountryCode());
        details.setPracticeLocation(invitation.getPatientInvitation().getPracticeLocation());
        details.setInviteCode(invitation.getInvitationCode().getCode());
        details.setRequestDate(invitation.getCreatedAt());
        details.setTreatmentFilled(isTreatmentFilled);
        details.setInvitationStatus(invitation.getStatus());
        details.setInvitationId(invitation.getId());
        details.setPatientProfile(patient.getProfilePictureUrl());
        details.setProductTypeName(patient.getProductTypeName());
        details.setPatientId(patient.getId());
        details.setInviteSent(
                inviteDate != null && inviteDate.toLocalDate().isEqual(LocalDate.now()) && sentCount == 1);
        details.setStatusList("INVITATION_SENT");
        if (alignerJourney != null) {
            Aligner firstAligner = alignerJourney.getAligners().get(0);

            details.setAlignerJourneyID(alignerJourney.getId());
            details.setTreatmentStartDate(firstAligner.getStartDate());
        }
        return details;
    }
}
