package com.dentalstack.patient.feature.aligner.dto.aligner.action;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PendingPatientActionRequest {

    private long doctorId;
    private long organizationId;
}
