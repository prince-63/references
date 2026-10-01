package com.dentalstack.patient.feature.doctor.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.ProgressStatus;
import com.dentalstack.patient.feature.patient.enums.PatientListType;
import com.dentalstack.patient.feature.patient.enums.PatientStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorRequestForPatientDetails {
    private Long doctorId;
    private PatientStatus patientStatus;
    private PatientListType patientListType;
    private ProgressStatus progressStatus;
    private Long organizationId;
    private Long profileId;
    private Boolean isFromChat;
}
