package com.dentalstack.patient.feature.doctor.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
}
