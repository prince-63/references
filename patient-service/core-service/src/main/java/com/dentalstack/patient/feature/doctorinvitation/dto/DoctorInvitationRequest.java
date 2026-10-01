package com.dentalstack.patient.feature.doctorinvitation.dto;

import com.dentalstack.patient.feature.doctor.enums.DoctorRole;
import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorInvitationRequest {

    private long organizationId;
    private long doctorId;
    private long profileId;

    @NotNull
    private String email;

    @NotNull
    private String firstName;

    private String lastName;

    private String mobileNo;

    private CountryCode countryCode;

    private String salutation;

    @Nullable
    private Long invitationId;

    private Boolean isInvitationSend;

    private Long subRoleId;

    @Nullable
    private InvitationStatus invitationStatus;

    private DoctorRole doctorRole;

    private Long invitedUserProfileId;

    private Boolean isTrackingEnabled;
    private Boolean isStlFileViewEnabled;
    private Boolean isScanFileViewEnabled;
    private Boolean isPrintFileViewEnabled;
}
