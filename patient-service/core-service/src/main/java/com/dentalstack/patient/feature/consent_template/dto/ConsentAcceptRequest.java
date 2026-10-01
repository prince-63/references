package com.dentalstack.patient.feature.consent_template.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConsentAcceptRequest {
    private Long fromProfileId;
    private Long templateId;
    private String content;
    private Long toProfileId;
    private Long toPatientId;
}
