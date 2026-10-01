package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.invitation.enums.InvitationStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotSetUpTreatmentPatient {

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
}
