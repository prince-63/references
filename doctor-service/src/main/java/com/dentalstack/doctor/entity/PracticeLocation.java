package com.dentalstack.doctor.entity;

import com.dentalstack.doctor.entity.organization.Organization;
import com.dentalstack.doctor.entity.user.UserProfile;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Builder
@Table(name = "practice_location")
public class PracticeLocation extends BaseEntity {

    private String practiceLocationName;

    private String mobileNumber;

    private String emailId;

    private String address;

    private String doctorName;

    private String practiceLocationType;

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

    private Long createdByDoctorId;

    private Long updatedByDoctorId;

    private boolean active;

    private String countryCode;

    private Long doctorId;

    private Long patientId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;
}
