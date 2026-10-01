package com.dentalstack.patient.feature.invitation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ValidateInvitationRequest {
    private String patientEmailId;
    private Long doctorId;
    private Long organizationId;
    private Long profileId;
}
