package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.patient.projection.PatientSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {

    private Long patientId;

    private String firstName;

    private String lastName;

    private String mobileNo;

    private String city;

    private String profileImage;

    private Long profileImageId;

    private String patientCode;

    private String email;

    private String patientFullName;
    private Long alignerJourneyId;

    public static PatientResponse from(PatientSummary patientSummary) {
        if (patientSummary == null) {
            return null;
        }

        return PatientResponse.builder()
                .patientId(patientSummary.getPatientId())
                .firstName(patientSummary.getFirstName())
                .lastName(patientSummary.getLastName())
                .mobileNo(patientSummary.getMobileNumber())
                .city(patientSummary.getCity())
                .profileImage(patientSummary.getProfilePictureUrl())
                .profileImageId(patientSummary.getProfilePictureId())
                .patientCode(patientSummary.getUuid())
                .email(patientSummary.getEmail())
                .patientFullName(fullName(patientSummary.getFirstName(), patientSummary.getLastName()))
                .alignerJourneyId(patientSummary.getAlignerJourneyId())
                .build();
    }

    public static String fullName(String firstName, String lastName) {
        if (lastName != null) {
            return firstName != null ? firstName + " " + lastName : lastName;
        } else {
            return firstName != null ? firstName : "";
        }
    }
}
