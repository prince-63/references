package com.dentalstack.auth.dto.doctor.invitation;

import com.dentalstack.auth.dto.doctor.DoctorUrlSignUpRequest;
import com.dentalstack.auth.enums.doctor.UserRegistrationType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorInvitationAcceptRequest {
    @NotNull
    private String email;

    private String mobileNo;

    private String countryCode;

    @NotNull
    private String firstName;

    private String lastName;

    private String salutation;
    private UserRegistrationType registrationType;
    private String invitationCode;
    private long organizationId;
    private long doctorId;
    private String brand;
    private String xOrgName;

    public static DoctorInvitationAcceptRequest from(DoctorUrlSignUpRequest request, String xOrgName) {
        return DoctorInvitationAcceptRequest.builder()
                .email(request.getEmail())
                .mobileNo(request.getMobileNo())
                .countryCode(request.getCountryCode())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .salutation(request.getSalutation())
                .registrationType(request.getRegistrationType())
                .invitationCode(request.getInvitationCode())
                .organizationId(request.getOrganizationId())
                .doctorId(request.getDoctorId())
                .brand(request.getBrand())
                .xOrgName(xOrgName)
                .build();
    }
}
