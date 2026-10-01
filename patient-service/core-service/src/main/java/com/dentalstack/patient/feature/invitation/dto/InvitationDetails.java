package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.invitation.entity.Invitation;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvitationDetails {

    private long inviterId;

    @NotNull
    private UserType inviterUserType;

    private String invitationCode;

    @NotNull
    private UserType invitedUserType;

    private long patientId;

    private String email;
    private String mobile;
    private CountryCode countryCode;
    private String chiefComplaint;

    @NotNull
    private InvitationStatus status;

    public static InvitationDetails from(Invitation invitation) {
        assert invitation.getPatientInvitation() != null;
        return InvitationDetails.builder()
                .inviterId(invitation.getInviterId())
                .inviterUserType(invitation.getInviterUserType())
                .invitedUserType(invitation.getInvitedUserType())
                .invitationCode(invitation.getInvitationCode().getCode())
                .status(invitation.getStatus())
                .email(invitation.getPatientInvitation().getEmail())
                .mobile(invitation.getPatientInvitation().getMobile())
                .patientId(invitation.getPatientInvitation().getPatient().getId())
                .countryCode(invitation.getPatientInvitation().getPatient().getCountryCode())
                .chiefComplaint(invitation.getPatientInvitation().getPatient().getChiefComplaint())
                .build();
    }
}
