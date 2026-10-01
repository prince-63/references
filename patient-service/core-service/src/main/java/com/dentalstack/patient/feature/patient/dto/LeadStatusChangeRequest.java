package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LeadStatusChangeRequest {

    @NotNull
    private PatientStatus status;

    @NotNull
    private long patientId;
}
