package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.user.enums.UserType;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.language.Language;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvitePatientRequest {
    @NotNull
    private String firstName;

    private String lastName;
    private String email;
    private String mobile;
    private CountryCode countryCode;
    private String practiceLocation;
    private Integer age;
    private String gender;
    private String customerMappedId;
    private long inviterId;

    private String chiefComplaint;

    @NotNull
    private UserType inviterUserType;

    private Language language;
    private Long practiceLocationId;
    private String country;
    private String city;
    private String state;
    private String organizationId;
    private String profileId;
}
