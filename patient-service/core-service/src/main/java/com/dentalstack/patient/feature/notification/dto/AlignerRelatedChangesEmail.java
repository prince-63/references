package com.dentalstack.patient.feature.notification.dto;

import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.patient.entity.Patient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerRelatedChangesEmail {
    private String doctorFirstName;
    private String doctorLastName;
    private String patientFirstName;
    private String doctorEmail;

    public static AlignerRelatedChangesEmail from(Patient patient, DoctorDetails doctor) {
        return AlignerRelatedChangesEmail.builder()
                .doctorFirstName(doctor.getFirstName())
                .doctorLastName(doctor.getLastName())
                .doctorEmail(doctor.getEmail())
                .patientFirstName(patient.getFirstName())
                .build();
    }
}
