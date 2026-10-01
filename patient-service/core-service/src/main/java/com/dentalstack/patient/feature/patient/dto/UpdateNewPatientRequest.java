package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateNewPatientRequest {

    private long patientId;
    private String lastname;
    private String email;
    private String mobile;
    private String gender;
    private String customerMappedId;
    private Integer age;
    private CountryCode countryCode;
    private String practiceLocationName;
    private long practiceLocationId;
    private String chiefComplaint;
    private String country;
    private String city;
    private String state;
}
