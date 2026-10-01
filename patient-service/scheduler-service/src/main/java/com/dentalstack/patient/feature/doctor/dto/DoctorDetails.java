package com.dentalstack.patient.feature.doctor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DoctorDetails {
    private Long id;
    private String UUID;
    private String firstName;
    private String lastName;
    private String middleName;
    private String address;
    private String city;
    private String email;
    private String mobile;
    private String countryName;
    private Long patientId;
    private Long doctorId;
    private boolean active;
    private String practiceLocationName;
    private boolean visible;
    private String description;
    private String dciNumber;
    private String doctorImage;
    private String doctorProfileUrl;
    private String countryCode;
    private String dentalCouncilName;
    private Date dateOfBirth;
    private String specialization;
    private Integer age;
    private boolean isDrToDisplay;
    private String orgName;

    public String fullName() {
        return String.join(" ", firstName, lastName);
    }
}
