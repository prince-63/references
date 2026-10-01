package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateLeadDetails {

    @NotNull
    private Long patientId;

    private String firstName;
    private String lastName;
    private String email;
    private String gender;
    private Integer age;
    private String customerMappedId;
    private String mobile;
    private String practiceLocationName;
    private String chiefComplaint;
    private CountryCode countryCode;

    @Nullable
    private Long practiceLocationId;

    private Boolean isPatientDetailsEdited;
    private String city;
    private String state;
    private String country;

    private Long practiceProfileId;
    private Long organizationId;
    private Long profileId;
    private Boolean isPracticeAssigned;
    private Long doctorId;
    private Boolean hasReadExistingPatientForm;
}
