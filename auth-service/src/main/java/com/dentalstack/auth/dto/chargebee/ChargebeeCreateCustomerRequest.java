package com.dentalstack.auth.dto.chargebee;

import static java.lang.Math.*;

import com.dentalstack.auth.dto.doctor.*;
import com.dentalstack.auth.enums.doctor.DoctorRole;
import jakarta.annotation.Nullable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChargebeeCreateCustomerRequest {

    private String firstName;

    @Nullable
    private String lastName;

    @Nullable
    private String phone;

    @Nullable
    private String email;

    private Long doctorId;

    private Long userProfileId;

    private List<DoctorRole> roles;

    private Long inviterId;

    private Long inviterProfileId;

    private String invitationCode;

    private Long organizationId;

    private String xOrgName;

    public static ChargebeeCreateCustomerRequest from(
            DoctorDetails doctorDetails, DoctorPasswordSignUpRequest doctorPasswordSignUpRequest, String xOrgName) {
        Long doctorId = doctorDetails.getDoctorId();

        Long userProfileId = doctorDetails.getProfiles().stream()
                .filter(profile -> profile.getDoctorId() == doctorId)
                .map(DoctorDetails.ProfileDetails::getProfileId)
                .findFirst()
                .orElse(null);

        return ChargebeeCreateCustomerRequest.builder()
                .firstName(doctorPasswordSignUpRequest.getFirstName())
                .lastName(doctorPasswordSignUpRequest.getLastName())
                .phone(doctorDetails.getMobile())
                .email(doctorDetails.getEmail())
                .doctorId(doctorId)
                .userProfileId(userProfileId)
                .roles(doctorPasswordSignUpRequest.getRoles())
                .organizationId(doctorPasswordSignUpRequest.getOrganizationId())
                .xOrgName(xOrgName)
                .build();
    }

    public static ChargebeeCreateCustomerRequest from(
            DoctorDetails doctorDetails, SsoUserSignUpRequest doctorPasswordSignUpRequest) {
        Long doctorId = doctorDetails.getDoctorId();

        // Find the profile that matches the doctorId
        Long userProfileId = doctorDetails.getProfiles().stream()
                .filter(profile -> profile.getDoctorId() == doctorId)
                .map(profile -> profile.getProfileId())
                .findFirst()
                .orElse(null); // Handle case where no match is found

        return ChargebeeCreateCustomerRequest.builder()
                .firstName(doctorPasswordSignUpRequest.getFirstName())
                .lastName(doctorPasswordSignUpRequest.getLastName())
                .phone(doctorDetails.getMobile())
                .email(doctorDetails.getEmail())
                .doctorId(doctorId)
                .userProfileId(userProfileId)
                .roles(doctorPasswordSignUpRequest.getRoles())
                .build();
    }

    public static ChargebeeCreateCustomerRequest from(
            DoctorDetails doctorDetails, DoctorGoogleSignupRequest doctorPasswordSignUpRequest, String xOrgName) {
        Long doctorId = doctorDetails.getDoctorId();

        // Find the profile that matches the doctorId
        Long userProfileId = doctorDetails.getProfiles().stream()
                .filter(profile -> profile.getDoctorId() == doctorId)
                .map(DoctorDetails.ProfileDetails::getProfileId)
                .findFirst()
                .orElse(null); // Handle case where no match is found

        return ChargebeeCreateCustomerRequest.builder()
                .firstName(doctorPasswordSignUpRequest.getFirstName())
                .lastName(doctorPasswordSignUpRequest.getLastName())
                .phone(doctorDetails.getMobile())
                .email(doctorDetails.getEmail())
                .doctorId(doctorId)
                .userProfileId(userProfileId)
                .roles(doctorPasswordSignUpRequest.getRoles())
                .xOrgName(xOrgName)
                .organizationId(doctorPasswordSignUpRequest.getOrganizationId())
                .build();
    }

    public static ChargebeeCreateCustomerRequest from(
            DoctorDetails doctorDetails,
            List<DoctorRole> roles,
            Long inviterId,
            Long inviterProfileId,
            DoctorUrlSignUpRequest request,
            String xOrgName) {

        Long doctorId = doctorDetails.getDoctorId();

        // Find the profile that matches the doctorId
        Long userProfileId;
        if (request.getOrganizationId() != 0L) {
            userProfileId = doctorDetails.getProfiles().stream()
                    .filter(profile -> profile.getDoctorId() == doctorId)
                    .filter(profile -> profile.getOrganizationId() == request.getOrganizationId())
                    .map(DoctorDetails.ProfileDetails::getProfileId)
                    .findFirst()
                    .orElse(null);
        } else {
            userProfileId = doctorDetails.getProfiles().stream()
                    .filter(profile -> profile.getDoctorId() == doctorId)
                    .map(DoctorDetails.ProfileDetails::getProfileId)
                    .findFirst()
                    .orElse(null);
        }

        return ChargebeeCreateCustomerRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(doctorDetails.getMobile())
                .email(doctorDetails.getEmail())
                .doctorId(doctorDetails.getDoctorId())
                .roles(roles)
                .userProfileId(userProfileId)
                .inviterId(inviterId)
                .inviterProfileId(inviterProfileId)
                .invitationCode(request.getInvitationCode())
                .organizationId(request.getOrganizationId())
                .xOrgName(xOrgName)
                .build();
    }
}
