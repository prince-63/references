package com.dentalstack.patient.feature.invitation.entity;

import com.dentalstack.patient.feature.invitation.dto.InvitePatientRequest;
import com.dentalstack.patient.feature.invitation.dto.UpdateInvitationRequest;
import com.dentalstack.patient.feature.invitation.dto.v2.InvitePatientRequestV2;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.Optional;
import lombok.*;

@Entity
@Table(
        name = "patient_invitation_details",
        indexes = {
            @Index(name = "IX_patient_invitation_details_patient_id", columnList = "patient_id"),
            @Index(name = "IX_patient_invitation_details_email", columnList = "email"),
            @Index(name = "IX_patient_invitation_details_mobile", columnList = "mobile"),
            @Index(name = "IX_patient_invitation_details_invitation_id", columnList = "invitation_id"),
            @Index(name = "IX_patient_invitation_details_first_name_last_name", columnList = "firstName, lastName")
        })
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientInvitationDetails extends BaseEntity {

    private Long patientMappedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @ToString.Exclude
    private Patient patient;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitation_id")
    @ToString.Exclude
    private Invitation invitation;

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

    public static PatientInvitationDetails from(InvitePatientRequest request, Invitation invite, Patient patient) {
        return PatientInvitationDetails.builder()
                .invitation(invite)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(Optional.ofNullable(request.getEmail())
                        .map(String::toLowerCase)
                        .orElse(null))
                .mobile(request.getMobile())
                .countryCode(request.getCountryCode())
                .patient(patient)
                .practiceLocation(request.getPracticeLocation())
                .build();
    }

    public static PatientInvitationDetails from(InvitePatientRequestV2 request, Invitation invite, Patient patient) {
        return PatientInvitationDetails.builder()
                .invitation(invite)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(Optional.ofNullable(request.getEmail())
                        .map(String::toLowerCase)
                        .orElse(null))
                .mobile(request.getMobile())
                .countryCode(request.getCountryCode())
                .patient(patient)
                .practiceLocation(request.getPracticeLocation())
                .build();
    }

    public static PatientInvitationDetails update(
            UpdateInvitationRequest request, PatientInvitationDetails patientInvitationDetails) {

        Optional.ofNullable(request.getMobile()).ifPresent(patientInvitationDetails::setMobile);
        Optional.ofNullable(request.getEmail()).ifPresent(patientInvitationDetails::setEmail);
        Optional.ofNullable(request.getLastName()).ifPresent(patientInvitationDetails::setLastName);
        Optional.ofNullable(request.getPracticeLocation()).ifPresent(patientInvitationDetails::setPracticeLocation);
        Optional.ofNullable(request.getCountryCode()).ifPresent(patientInvitationDetails::setCountryCode);

        return patientInvitationDetails;
    }

    public static PatientInvitationDetails from(PatientInvitationDetails pl) {
        return PatientInvitationDetails.builder()
                .invitation(pl.invitation)
                .firstName(pl.getFirstName())
                .lastName(pl.getLastName())
                .email(pl.getEmail())
                .mobile(pl.getMobile())
                .countryCode(pl.getCountryCode())
                .practiceLocation(pl.getPracticeLocation())
                .build();
    }
}
