package com.dentalstack.patient.feature.workflow.pre_treatment.dto;

import com.dentalstack.patient.feature.caserecord.dto.CaseRecordDetails;
import com.dentalstack.patient.feature.prescription.dto.prescription.PrescriptionDetails;
import java.time.ZonedDateTime;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientPreTreatmentResponse {

    private Long id;
    private Long patientId;
    private String patientName;
    private Long addedByProfileId;
    private String addedByName;
    private boolean isActive;
    private CaseRecordDetails caseRecordDetails;
    private PrescriptionDetails prescriptionDetails;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
