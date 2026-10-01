package com.dentalstack.auth.dto;

import com.dentalstack.auth.dto.doctor.DoctorDetails;
import com.dentalstack.auth.entity.Auth;
import com.dentalstack.auth.enums.auth.AuthStatus;
import com.dentalstack.auth.enums.patient.UserType;
import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthDetails {
    private Long userId;

    private UserType userType;

    private String email;
    private String mobileNo;
    private String firstName;
    private String lastName;
    private String countryCode;
    private String salutation;

    private String token;
    private ZonedDateTime tokenExpireAt;

    @Builder.Default
    private List<AuthStageDetails> stages = new ArrayList<>();

    private AuthStatus status;
    private boolean skipRegistration;
    private String redirectUrl;
    private String ssoToken;
    private Long authId;
    private Long organizationId;

    public static AuthDetails from(Auth auth) {
        return AuthDetails.builder()
                .userType(auth.getUserType())
                .email(auth.getEmail())
                .mobileNo(auth.getMobileNo())
                .token(auth.getToken())
                .tokenExpireAt(auth.getTokenExpireAt())
                .stages(auth.getStages().stream().map(AuthStageDetails::from).toList())
                .status(auth.getStatus())
                .firstName(auth.getFirstName())
                .lastName(auth.getLastName())
                .countryCode(auth.getCountryCode())
                .salutation(auth.getSalutation())
                .skipRegistration(auth.getFirstName() != null)
                .ssoToken(auth.getSsoToken())
                .authId(auth.getId())
                .organizationId(auth.getOrganizationId())
                .build();
    }

    public static AuthDetails from(Auth auth, String redirectUrl, DoctorDetails details) {
        return AuthDetails.builder()
                .userType(auth.getUserType())
                .email(details.getEmail())
                .mobileNo(details.getMobile())
                .token(auth.getToken())
                .tokenExpireAt(auth.getTokenExpireAt())
                .stages(auth.getStages().stream().map(AuthStageDetails::from).toList())
                .status(auth.getStatus())
                .firstName(details.getFirstName())
                .lastName(details.getLastName())
                .countryCode(auth.getCountryCode())
                .salutation(details.getSalutation())
                .skipRegistration(details.getFirstName() != null)
                .redirectUrl(redirectUrl)
                .userId(details.getDoctorId())
                .countryCode(details.getCountryCode())
                .ssoToken(auth.getSsoToken())
                .authId(auth.getId())
                .build();
    }

    public static AuthDetails from(Auth auth, Long userId) {
        return AuthDetails.builder()
                .userId(userId)
                .userType(auth.getUserType())
                .email(auth.getEmail())
                .mobileNo(auth.getMobileNo())
                .token(auth.getToken())
                .tokenExpireAt(auth.getTokenExpireAt())
                .stages(auth.getStages().stream().map(AuthStageDetails::from).toList())
                .status(auth.getStatus())
                .firstName(auth.getFirstName())
                .lastName(auth.getLastName())
                .countryCode(auth.getCountryCode())
                .salutation(auth.getSalutation())
                .skipRegistration(auth.getFirstName() != null)
                .ssoToken(auth.getSsoToken())
                .authId(auth.getId())
                .organizationId(auth.getOrganizationId())
                .build();
    }
}
