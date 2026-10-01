package com.dentalstack.patient.feature.aligner.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientRemindAllForAnalytics {
    private Long patientId;
    private String patientFullName;
    private String patientProfileUrl;
}
