package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.doctor.entity.PracticeLocation;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PracticeLocationDetails {

    private Long practiceLocationId;
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
    private String practiceLocationType;
    private String socialHandles;
    private Long createdBy;
    private Long updatedBy;
    private Long deletedBy;
    private LocalDateTime deleteAt;
    private String countryCode;
    private Long doctorId;
    private boolean active;
    private int size;

    public static PracticeLocationDetails searchfrom(PracticeLocation practiceLocation) {
        return PracticeLocationDetails.builder()
                .practiceLocationName(practiceLocation.getPracticeLocationName())
                .mobileNumber(practiceLocation.getMobileNumber())
                .emailId(practiceLocation.getEmailId())
                .city(practiceLocation.getCity())
                .state(practiceLocation.getState())
                .country(practiceLocation.getCountry())
                .doctorId(practiceLocation.getDoctorId())
                .build();
    }
}
