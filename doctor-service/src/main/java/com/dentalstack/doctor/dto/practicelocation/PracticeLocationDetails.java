package com.dentalstack.doctor.dto.practicelocation;

import com.dentalstack.doctor.entity.PracticeLocation;
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

    public static PracticeLocationDetails from(PracticeLocation practiceLocation) {
        return PracticeLocationDetails.builder()
                .practiceLocationName(practiceLocation.getPracticeLocationName())
                .mobileNumber(practiceLocation.getMobileNumber())
                .emailId(practiceLocation.getEmailId())
                .address(practiceLocation.getAddress())
                .doctorName(practiceLocation.getDoctorName())
                .practiceLocationInChargeDoctorName(practiceLocation.getPracticeLocationInChargeDoctorName())
                .pinCode(practiceLocation.getPinCode())
                .city(practiceLocation.getCity())
                .state(practiceLocation.getState())
                .country(practiceLocation.getCountry())
                .googleMapUrl(practiceLocation.getGoogleMapUrl())
                .doctorType(practiceLocation.getDoctorType())
                .healthCareNumber(practiceLocation.getHealthCareNumber())
                .websiteUrl(practiceLocation.getWebsiteUrl())
                .clinicLogo(practiceLocation.getClinicLogo())
                .businessRegistrationNumber(practiceLocation.getBusinessRegistrationNumber())
                .clinicTiming(practiceLocation.getClinicTiming())
                .serviceOffered(practiceLocation.getServiceOffered())
                .socialHandles(practiceLocation.getSocialHandles())
                .createdBy(practiceLocation.getCreatedByDoctorId())
                .practiceLocationType(practiceLocation.getPracticeLocationType())
                .practiceLocationId(practiceLocation.getId())
                .active(practiceLocation.isActive())
                .countryCode(practiceLocation.getCountryCode())
                .doctorId(practiceLocation.getDoctorId())
                .build();
    }
}
