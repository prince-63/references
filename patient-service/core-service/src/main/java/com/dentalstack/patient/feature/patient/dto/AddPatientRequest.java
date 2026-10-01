package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddPatientRequest {

    private long doctorId;
    private String firstname;
    private String lastname;
    private String email;
    private String mobile;
    private CountryCode countryCode;
    private long practiceLocationId;
    private String chiefComplaint;
    private String practiceLocationName;
}
