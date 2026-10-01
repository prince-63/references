package com.dentalstack.doctor.dto.practicelocation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdatePracticeLocationRequest {

    @NotNull(message = "Practice location ID is required")
    private Long practiceLocationId;

    @NotBlank(message = "Practice location name is required")
    private String practiceLocationName;

    private String mobileNumber;

    private String emailId;

    private String address;

    private Long pincode;

    private String city;

    private String state;

    private String googleMapUrl;

    private String websiteUrl;

    private Long doctorId;

    private String doctorName;

    private Long userId;

    private String country;

    private String practiceLocationDoctorName;

    private String practiceLocationType;

    private boolean active;
    private Long profileId;
}
