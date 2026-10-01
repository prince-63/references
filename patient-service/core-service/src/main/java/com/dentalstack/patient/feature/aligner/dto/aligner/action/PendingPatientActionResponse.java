package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import com.dentalstack.patient.feature.patient.entity.Patient;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PendingPatientActionResponse implements Serializable {

    private static final long serialVersionUID = 1L;
    private Long patientId;
    private String patientName;
    private String patientProfile;
    private String email;

    public static PendingPatientActionResponse from(Patient patient) {
        return PendingPatientActionResponse.builder()
                .patientId(patient.getId())
                .patientName(patient.fullName())
                .patientProfile(patient.getProfilePictureUrl())
                .email(patient.getEmail())
                .build();
    }
}
