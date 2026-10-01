package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import com.dentalstack.patient.global.enums.CountryCode;
import com.dentalstack.patient.global.enums.ProductTypeName;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientResponseMobile {

    private long patientId;
    private String firstName;
    private String lastName;
    private String mobile;

    private CountryCode countryCode;
    private long practiceLocationId;
    private String practiceLocationName;

    private String email;
    private ZonedDateTime patientAddedDate;

    private ProductTypeName productTypeName;
    private List<ProductTypeName> productTypeNames;

    private String chiefComplaint;
    private PatientStatus patientStatus;

    public static PatientResponseMobile from(Patient patient) {
        return PatientResponseMobile.builder()
                .patientId(patient.getId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .mobile(patient.getMobileNo())
                .countryCode(patient.getCountryCode())
                .practiceLocationId(patient.getPracticeLocationId())
                .practiceLocationName(patient.getPracticeLocationName())
                .email(patient.getEmail())
                .patientStatus(patient.getPatientStatus())
                .patientAddedDate(patient.getCreatedAt())
                .chiefComplaint(patient.getChiefComplaint())
                .productTypeNames(patient.getProductTypeNames())
                .productTypeName(patient.getProductTypeName())
                .build();
    }
}
