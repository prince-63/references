package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.doctor.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangePatientInvitationStatusRequest {
    private long doctorId;
    private long patientId;
    private Status status;
}
