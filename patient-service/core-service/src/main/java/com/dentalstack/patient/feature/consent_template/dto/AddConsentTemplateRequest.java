package com.dentalstack.patient.feature.consent_template.dto;

import com.dentalstack.patient.feature.consent_template.entity.ConsentTemplate;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateLocation;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateType;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddConsentTemplateRequest {
    private Long templateId;
    private Long profileId;
    private String name;
    private String title;
    private String content;
    private Boolean isActive;
    private JsonNode placeholders;
    private ConsentTemplateType type;
    private ConsentTemplateLocation location;
    private Boolean isDefault;

    public ConsentTemplate toEntity(UserProfile userProfile) {
        return ConsentTemplate.builder()
                .userProfile(userProfile)
                .name(name)
                .title(title)
                .content(content)
                .isActive(isActive != null ? isActive : true)
                .type(type)
                .location(location)
                .isDefault(isDefault != null ? isDefault : false)
                .placeholders(placeholders)
                .build();
    }
}
