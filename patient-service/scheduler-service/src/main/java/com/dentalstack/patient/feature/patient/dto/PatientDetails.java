package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.entity.PatientLead;
import com.dentalstack.patient.feature.patient.entity.PatientLogin;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.feature.product.enums.ProductTypeName;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.Language;
import java.io.Serial;
import java.io.Serializable;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDetails implements Serializable {

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
    private Boolean hasReadExistingPatientForm;
    private Boolean isPracticeAssigned;

    public static PatientDetails from(Patient patient) {
        PatientDetails details = new PatientDetails();

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
        PatientLogin patientLogin = patient.getPatientLogin();
        if (patientLogin != null) {
            details.setLastLoginAt(patientLogin.getLastLoginAt());
        }

        return details;
    }

    public static PatientDetails from(PatientLead patient) {
        PatientDetails details = new PatientDetails();
        details.setId(patient.getId());
        details.setFirstName(patient.getFirstName());
        details.setLastName(patient.getLastName());
        details.setFullName(details.fullName(patient.getFirstName(), patient.getLastName()));
        details.setProfilePictureUrl(patient.getPatientProfileUrl());
        details.setAge(patient.getAge());
        details.setEmail(patient.getEmail());
        details.setMobile(patient.getMobileNo());
        details.setUUID(patient.getUUID());
        details.setStatus(patient.getPatientStatus());
        details.setDoctorId(patient.getDoctorId());
        details.setCountryCode(patient.getCountryCode());
        details.setGender(patient.getGender());
        details.setLanguage(patient.getLanguage());
        details.setOrgName(patient.getOrgName());
        details.setCountry(patient.getCountry());
        details.setState(patient.getState());
        details.setCity(patient.getCity());
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

    public static PatientDetails searchfrom(Patient patient, Long orgProfileId) {

        boolean isPracticeAssigned = true;
        if (orgProfileId != null) {
            isPracticeAssigned =
                    !patient.getDoctorOrganization().getUserProfile().getId().equals(orgProfileId);
        }
        PatientDetails details = new PatientDetails();
        details.setId(patient.getId());
        details.setFullName(details.fullName(patient.getFirstName(), patient.getLastName()));
        details.setFirstName(patient.getFirstName());
        details.setLastName(patient.getLastName());
        details.setProfilePictureUrl(patient.getProfilePictureUrl());
        details.setEmail(patient.getEmail());
        details.setMobile(patient.getMobileNo());
        details.setProductTypeNames(patient.getProductTypeNames());
        details.setGender(patient.getGender());
        details.setLanguage(patient.getLanguage());
        details.setIsPracticeAssigned(isPracticeAssigned);
        return details;
    }
}
