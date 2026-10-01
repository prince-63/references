package com.dentalstack.doctor.dto.invitation;

import com.dentalstack.doctor.enums.doctor.DoctorRole;
import com.dentalstack.doctor.enums.user.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String mobileNo;

    private CountryCode countryCode;

    private String salutation;

    @NotNull(message = "Doctor role is required")
    private DoctorRole doctorRole;

    @Nullable
    private Long invitationId;

    private Boolean isInvitationSend;
    private Long invitedUserProfileId;
    private Boolean isTrackingEnabled;
    private Boolean isStlFileViewEnabled;
    private Boolean isScanFileViewEnabled;
    private Boolean isPrintFileViewEnabled;
}
