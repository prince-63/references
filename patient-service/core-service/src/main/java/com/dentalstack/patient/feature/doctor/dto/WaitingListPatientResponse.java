package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.invitation.entity.PatientInvitationDetails;
import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
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
public class WaitingListPatientResponse implements Serializable {

    private static final long serialVersionUID = 1L;

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

    private boolean inviteSent;
    private long alignerJourneyID;
    private LocalDate treatmentStartDate;
    private ProductTypeName productTypeName;

    public static WaitingListPatientResponse from(AlignerJourney alignerJourney) {
        var patient = alignerJourney.getPatient();

        return WaitingListPatientResponse.builder()
                .requestDate(alignerJourney.getCreatedAt())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .patientId(patient.getId())
                .patientProfile(patient.getProfilePictureUrl())
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .alignerJourneyID(alignerJourney.getId())
                .statusList("WAITING_LIST")
                .isTreatmentFilled(true)
                .countryCode(alignerJourney.getPatient().getCountryCode())
                .productTypeName(patient.getProductTypeName())
                .build();
    }

    public static WaitingListPatientResponse from(
            AlignerJourney alignerJourney, PatientInvitationDetails patientInvitationDetails, Aligner aligner) {
        var patient = alignerJourney.getPatient();
        var invitation = patientInvitationDetails.getInvitation();
        assert invitation.getPatientInvitation() != null;
        var sentCount = invitation.getSentCount();
        var inviteDate = invitation.getResentInviteAt();

        return WaitingListPatientResponse.builder()
                .inviteSent(inviteDate != null && inviteDate.toLocalDate().isEqual(LocalDate.now()) && sentCount == 1)
                .requestDate(invitation.getCreatedAt())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .patientId(patient.getId())
                .patientProfile(patient.getProfilePictureUrl())
                .mobile(patient.getMobileNo())
                .email(patient.getEmail())
                .alignerJourneyID(alignerJourney.getId())
                .invitationId(invitation.getId())
                .inviteCode(invitation.getInvitationCode().getCode())
                .practiceLocation(invitation.getPatientInvitation().getPracticeLocation())
                .statusList("WAITING_LIST")
                .isTreatmentFilled(true)
                .countryCode(alignerJourney.getPatient().getCountryCode())
                .treatmentStartDate(aligner.getStartDate())
                .productTypeName(patient.getProductTypeName())
                .build();
    }
}
