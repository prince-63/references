package com.dentalstack.doctor.dto.invitation;

import com.dentalstack.doctor.enums.invitation.UserRegistrationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorInvitationAcceptRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String mobileNo;

    private String countryCode;

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    private String salutation;
    private UserRegistrationType registrationType;

    @NotBlank(message = "Invitation code is required")
    private String invitationCode;

    private long organizationId;
    private long doctorId;
    private Boolean isOnBoardScreenVisited;
    private long profileId;
    private String brand;
    private String xOrgName;
}
