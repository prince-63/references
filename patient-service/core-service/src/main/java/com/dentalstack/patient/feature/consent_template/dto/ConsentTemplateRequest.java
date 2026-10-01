package com.dentalstack.patient.feature.consent_template.dto;

import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateLocation;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConsentTemplateRequest {
    private Long profileId;
    private ConsentTemplateType consentTemplateType;
    private ConsentTemplateLocation consentTemplateLocation;
}
