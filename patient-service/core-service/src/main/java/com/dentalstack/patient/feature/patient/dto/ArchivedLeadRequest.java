package com.dentalstack.patient.feature.patient.dto;

import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchivedLeadRequest {
    private PatientStatus patientStatus;
    private long doctorId;
    private long profileId;
    private long organizationId;
    private int pageNumber;
    private int pageSize;
    private String search;
}
