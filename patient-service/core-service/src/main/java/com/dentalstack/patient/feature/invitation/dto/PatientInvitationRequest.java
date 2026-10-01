package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.global.enums.CountryCode;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientInvitationRequest {
    private Long doctorId;
    private String doctorName;
    private String doctorEmail;
    private Long doctorPracticeLocationId;
    private String alignerBrandName;

    private Long patientId;
    private String patientMobileNo;

    @NotNull
    private CountryCode patientCountryCode;

    private String firstName;
    private String lastName;
}
