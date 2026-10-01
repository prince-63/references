package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.dentalstack.patient.global.enums.language.Language;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDetailsForWorkflow implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String firstName;
    private String lastName;

    private String profilePictureUrl;

    private List<AddressDetails> addresses = new ArrayList<>();

    private Integer age;
    private String email;
    private String mobile;
    private String UUID;
    private PatientStatus status;

    private Long doctorId;

    private ZonedDateTime lastLoginAt;

    private CountryCode countryCode;
    private String practiceLocation;
    private String chiefComplaint;
    private List<ProductTypeName> productTypeNames;
    private String gender;
    private String fullName;
    private Language language;
    private String orgName;
    private String country;
    private String city;
    private String state;
    private String customerMappedId;
    private AssignedPractice assignedPractice;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AssignedPractice {
        private Long practiceDoctorId;
        private Long practiceProfileId;
        private Long practiceOrganizationId;
        private String name;
    }

    public static PatientDetailsForWorkflow from(Patient patient) {
        PatientDetailsForWorkflow details = new PatientDetailsForWorkflow();
        AssignedPractice assignedPracticeifExists = AssignedPractice.builder()
                .practiceDoctorId(patient.getDoctorOrganization().getDoctor().getId())
                .practiceProfileId(
                        patient.getDoctorOrganization().getUserProfile().getId())
                .practiceOrganizationId(
                        patient.getDoctorOrganization().getOrganization().getId())
                .name((patient.getDoctorOrganization()
                                        .getUserProfile()
                                        .getUser()
                                        .getSalutation() + " "
                                + patient.getDoctorOrganization()
                                        .getUserProfile()
                                        .getUser()
                                        .getFirstName() + " "
                                + patient.getDoctorOrganization()
                                        .getUserProfile()
                                        .getUser()
                                        .getLastName())
                        .trim())
                .build();
        details.setId(patient.getId());
        details.setFullName(details.fullName(patient.getFirstName(), patient.getLastName()));
        details.setFirstName(patient.getFirstName());
        details.setLastName(patient.getLastName());
        details.setProfilePictureUrl(patient.getProfilePictureUrl());
        details.setAddresses(
                patient.getAddresses().stream().map(AddressDetails::from).toList());
        details.setAge(patient.getAge());
        details.setEmail(patient.getEmail());
        details.setMobile(patient.getMobileNo());
        details.setUUID(patient.getUUID());
        details.setStatus(patient.getPatientStatus());
        details.setDoctorId(patient.getAddedByUserId());
        details.setCountryCode(patient.getCountryCode());
        details.setPracticeLocation(patient.getPracticeLocationName());
        details.setChiefComplaint(patient.getChiefComplaint());
        details.setProductTypeNames(patient.getProductTypeNames());
        details.setGender(patient.getGender());
        details.setLanguage(patient.getLanguage());
        details.setOrgName(patient.getOrgName());
        details.setCountry(patient.getCountry());
        details.setState(patient.getState());
        details.setCity(patient.getCity());
        details.setCustomerMappedId(patient.getCustomerMappedId());
        details.setAssignedPractice(assignedPracticeifExists);
        details.setFullName(patient.fullName());

        return details;
    }

    public String fullName() {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }

    public String fullName(String firstName, String lastName) {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }
}
