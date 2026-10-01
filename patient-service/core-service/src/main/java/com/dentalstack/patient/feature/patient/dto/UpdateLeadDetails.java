package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
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
    private Boolean removePracticeLocation;
    private Long organizationId;
    private Long profileId;
    private Boolean isPracticeAssigned;
    private Long doctorId;
    private Boolean hasReadExistingPatientForm;

    private LocalDateTime nextFollowUp;
    private String labels;
    private String dateOfBirth;
    private String bloodGroup;
    private String emergencyContact;
    private List<String> allergies;
    private List<String> medicalConditions;
    private List<String> currentMedications;
    private Boolean prescriptionRead;
    private Boolean inviteModal;
    private Boolean caseRecord;
    private Long currentStep;
}
