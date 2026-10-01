package com.dentalstack.doctor.mapper;

import com.dentalstack.doctor.dto.practicelocation.AddPracticeLocationRequest;
import com.dentalstack.doctor.dto.practicelocation.UpdatePracticeLocationRequest;
import com.dentalstack.doctor.entity.PracticeLocation;
import com.dentalstack.doctor.entity.user.UserProfile;
import java.time.LocalDateTime;

/**
 * Mapper class responsible for creating and updating {@link PracticeLocation} entities
 * from various DTOs.
 */
public final class PracticeLocationMapper {

    private PracticeLocationMapper() {
        // Utility class — no instantiation
    }

    public static PracticeLocation fromAddRequest(AddPracticeLocationRequest req, UserProfile userProfile) {
        return PracticeLocation.builder()
                .practiceLocationName(req.getPracticeLocationName())
                .mobileNumber(req.getMobileNumber())
                .emailId(req.getEmailId())
                .address(req.getAddress())
                .doctorName(req.getDoctorName())
                .practiceLocationInChargeDoctorName(req.getPracticeLocationInChargeDoctorName())
                .pinCode(req.getPinCode())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .googleMapUrl(req.getGoogleMapUrl())
                .doctorType(req.getDoctorType())
                .healthCareNumber(req.getHealthCareNumber())
                .websiteUrl(req.getWebsiteUrl())
                .clinicLogo(req.getClinicLogo())
                .businessRegistrationNumber(req.getBusinessRegistrationNumber())
                .clinicTiming(req.getClinicTiming())
                .serviceOffered(req.getServiceOffered())
                .socialHandles(req.getSocialHandles())
                .createdByDoctorId(req.getDoctorId())
                .patientId(null)
                .updatedByDoctorId(null)
                .active(true)
                .countryCode(req.getCountryCode())
                .doctorId(req.getDoctorId())
                .userProfile(userProfile)
                .organization(userProfile.getOrganization())
                .build();
    }

    public static PracticeLocation updateFromRequest(
            PracticeLocation practiceLocation, UpdatePracticeLocationRequest request) {
        practiceLocation.setActive(request.isActive());
        practiceLocation.setPracticeLocationName(request.getPracticeLocationName());
        practiceLocation.setMobileNumber(request.getMobileNumber());
        practiceLocation.setEmailId(request.getEmailId());
        practiceLocation.setAddress(request.getAddress());
        practiceLocation.setPinCode(request.getPincode());
        practiceLocation.setCity(request.getCity());
        practiceLocation.setState(request.getState());
        practiceLocation.setGoogleMapUrl(request.getGoogleMapUrl());
        practiceLocation.setWebsiteUrl(request.getWebsiteUrl());
        practiceLocation.setUpdatedAt(LocalDateTime.now());
        practiceLocation.setUpdatedByDoctorId(request.getUserId());
        practiceLocation.setDoctorName(request.getDoctorName());
        practiceLocation.setCountry(request.getCountry());
        practiceLocation.setPracticeLocationType(request.getPracticeLocationType());
        practiceLocation.setPracticeLocationInChargeDoctorName(request.getPracticeLocationDoctorName());

        return practiceLocation;
    }
}
