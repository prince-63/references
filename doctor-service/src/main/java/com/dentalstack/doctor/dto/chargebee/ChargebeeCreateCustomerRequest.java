package com.dentalstack.doctor.dto.chargebee;

import com.dentalstack.doctor.dto.doctor.AddDoctorRequest;
import com.dentalstack.doctor.dto.doctor.DoctorDetails;
import com.dentalstack.doctor.entity.Doctor;
import com.dentalstack.doctor.enums.doctor.DoctorRole;
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
    private Long newProfileId;
    private Boolean isProfileCreating;

    public static ChargebeeCreateCustomerRequest from(
            Long profileId, Doctor doctor, List<DoctorRole> doctorRoles, Long newProfileId) {
        return ChargebeeCreateCustomerRequest.builder()
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .phone(doctor.getMobile())
                .email(doctor.getEmail())
                .doctorId(doctor.getId())
                .userProfileId(profileId)
                .newProfileId(newProfileId)
                .roles(doctorRoles)
                .isProfileCreating(true)
                .build();
    }

    public static ChargebeeCreateCustomerRequest from(DoctorDetails doctorDetails, AddDoctorRequest request) {
        Long doctorId = doctorDetails.getDoctorId();

        // Find the profile that matches the doctorId
        Long userProfileId = doctorDetails.getProfiles().stream()
                .filter(profile -> profile.getDoctorId() == doctorId)
                .map(DoctorDetails.ProfileDetails::getProfileId)
                .findFirst()
                .orElse(null); // Handle case where no match is found

        return ChargebeeCreateCustomerRequest.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(doctorDetails.getMobile())
                .email(doctorDetails.getEmail())
                .doctorId(doctorId)
                .userProfileId(userProfileId)
                .roles(request.getRoles())
                .build();
    }
}
