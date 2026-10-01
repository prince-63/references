package com.dentalstack.patient.feature.invitation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotifyPatientRequest {
    private Long patientId;
    private Long doctorId;
    private Long organizationId;
    private Long profileId;
}
