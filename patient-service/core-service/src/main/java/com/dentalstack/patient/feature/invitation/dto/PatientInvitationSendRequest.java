package com.dentalstack.patient.feature.invitation.dto;

import com.dentalstack.patient.feature.invitation.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PatientInvitationSendRequest {
    private Long doctorId;
    private Long patientId;
    private String patientMobile;
    private Status status;
    private Long doctorPracticeLocationId;
    private String alignerBrandName;

    public static PatientInvitationSendRequest from(PatientInvitationRequest request) {
        return PatientInvitationSendRequest.builder()
                .doctorId(request.getDoctorId())
                .patientId(request.getPatientId())
                .patientMobile(request.getPatientMobileNo())
                .alignerBrandName(request.getAlignerBrandName())
                .doctorPracticeLocationId(request.getDoctorPracticeLocationId())
                .status(Status.PENDING)
                .build();
    }
}
