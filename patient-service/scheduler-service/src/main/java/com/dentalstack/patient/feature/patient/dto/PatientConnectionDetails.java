package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.doctor.entity.organization.PatientDoctorOrganization;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.global.enums.CountryCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PatientConnectionDetails {
    private PatientDetails patientDetails;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PatientDetails {
        private Long id;
        private String firstName;
        private String lastName;
        private String country;
        private String city;
        private String state;
        private Integer age;
        private String gender;
        private String email;
        private String mobile;
        private CountryCode countryCode;
    }

    private Long doctorId;
    private Boolean isDoctorToDisplay;
    private String doctorProfileImage;
    private Boolean isConnected;
    private String practiceLocationName;
    private String getPracticeLocationAddress;
    private String firstName;
    private String lastName;
    private String salutation;

    public static PatientConnectionDetails from(
            Patient patient,
            PatientDoctorOrganization doctor,
            Boolean isConnected,
            String practiceLocationAddress,
            Long doctorId) {
        return PatientConnectionDetails.builder()
                .patientDetails(PatientDetails.builder()
                        .id(patient.getId())
                        .firstName(patient.getFirstName())
                        .lastName(patient.getLastName())
                        .country(patient.getCountry())
                        .city(patient.getCity())
                        .state(patient.getState())
                        .age(patient.getAge())
                        .gender(patient.getGender())
                        .email(patient.getEmail())
                        .mobile(patient.getMobileNo())
                        .countryCode(patient.getCountryCode())
                        .build())
                .doctorId(doctorId)
                .isDoctorToDisplay(false)
                .doctorProfileImage(
                        doctor.getUserProfile().getDoctorBilling() != null
                                ? doctor.getUserProfile().getDoctorBilling().getCompanyImageUrl()
                                : "")
                .isConnected(isConnected)
                .practiceLocationName(patient.getPracticeLocationName())
                .getPracticeLocationAddress(practiceLocationAddress)
                .firstName(
                        doctor.getUserProfile().getDoctorBilling() != null
                                ? doctor.getUserProfile().getDoctorBilling().getCompanyDisplayName()
                                : doctor.getUserProfile().getUser().getFirstName())
                .lastName(
                        doctor.getUserProfile().getDoctorBilling() != null
                                ? ""
                                : doctor.getUserProfile().getUser().getLastName() != null
                                        ? doctor.getUserProfile().getUser().getLastName()
                                        : "")
                .lastName(doctor.getUserProfile().getUser().getLastName())
                .salutation(doctor.getUserProfile().getUser().getSalutation())
                .build();
    }
}
