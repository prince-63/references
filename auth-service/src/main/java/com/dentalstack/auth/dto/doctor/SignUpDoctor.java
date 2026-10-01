package com.dentalstack.auth.dto.doctor;

import com.dentalstack.auth.enums.doctor.DoctorRole;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignUpDoctor {
    private String firstName;
    private String lastName;

    @NotNull
    private String email;

    private String mobile;

    private Boolean isOnBoardScreenVisited;
    private String countryCode;
    private String salutation;
    private String invitationCode;
    private List<DoctorRole> roles;
    private String brand;
    private List<DoctorRole> selectedRoles;
    private Long organizationId;
    private String xOrgName;

    public static SignUpDoctor from(DoctorPasswordSignUpRequest request, String xOrgName) {
        return SignUpDoctor.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobile(request.getMobileNo())
                .countryCode(request.getCountryCode())
                .salutation(request.getSalutation())
                .roles(request.getRoles())
                .brand(request.getBrand())
                .selectedRoles(request.getSelectedRoles())
                .organizationId(request.getOrganizationId())
                .xOrgName(xOrgName)
                .build();
    }

    public static SignUpDoctor from(SsoUserSignUpRequest request) {
        return SignUpDoctor.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobile(request.getMobileNo())
                .countryCode(request.getCountryCode())
                .salutation(request.getSalutation())
                .roles(request.getRoles())
                .brand(request.getBrand())
                .build();
    }

    public static SignUpDoctor fromUrl(DoctorUrlSignUpRequest request) {
        return SignUpDoctor.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .mobile(request.getMobileNo())
                .countryCode(request.getCountryCode())
                .salutation(request.getSalutation())
                .invitationCode(request.getInvitationCode())
                .brand(request.getBrand())
                .build();
    }

    public static SignUpDoctor from(DoctorGoogleSignupRequest request, String xOrgName) {
        return SignUpDoctor.builder()
                .email(request.getEmail())
                .mobile(request.getMobileNo())
                .firstName(request.getFirstName())
                .countryCode(request.getCountryCode())
                .lastName(request.getLastName())
                .salutation(request.getSalutation())
                .roles(request.getRoles())
                .brand(request.getBrand())
                .selectedRoles(request.getSelectedRoles())
                .organizationId(request.getOrganizationId())
                .xOrgName(xOrgName)
                .build();
    }
}
