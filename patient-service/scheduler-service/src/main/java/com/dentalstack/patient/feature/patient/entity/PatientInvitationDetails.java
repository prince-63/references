package com.dentalstack.patient.feature.patient.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
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

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @NotNull
    @OneToOne
    @JoinColumn(name = "invitation_id")
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
