package com.dentalstack.doctor.dto.practicelocation;

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
public class AddPracticeLocationRequest {

    @NotBlank(message = "Practice location name is required")
    private String practiceLocationName;

    private String mobileNumber;
    private String emailId;
    private String address;
    private String doctorName;
    private String practiceLocationInChargeDoctorName;
    private Long pinCode;
    private String city;
    private String state;
    private String country;
    private String googleMapUrl;
    private String doctorType;
    private String healthCareNumber;
    private String websiteUrl;
    private String clinicLogo;
    private String businessRegistrationNumber;
    private String clinicTiming;
    private String serviceOffered;
    private String socialHandles;
    private String countryCode;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    @NotNull(message = "Profile ID is required")
    private Long profileId;
}
