package com.dentalstack.patient.feature.consent_template.dto;

import com.dentalstack.patient.feature.consent_template.entity.ConsentTemplate;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateLocation;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateType;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.ZonedDateTime;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConsentTemplateDetails {
    private Long templateId;
    private Long userProfileId;
    private String name;
    private String title;
    private String content;
    private Boolean isActive;
    private JsonNode placeholders;
    private ConsentTemplateType type;
    private ConsentTemplateLocation location;
    private Boolean isDefault;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static ConsentTemplateDetails from(ConsentTemplate template) {
        return ConsentTemplateDetails.builder()
                .templateId(template.getId())
                .userProfileId(
                        template.getUserProfile() != null
                                ? template.getUserProfile().getId()
                                : null)
                .name(template.getName())
                .title(template.getTitle())
                .content(template.getContent())
                .isActive(template.getIsActive())
                .placeholders(template.getPlaceholders())
                .type(template.getType())
                .location(template.getLocation())
                .isDefault(template.getIsDefault())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }

    public static ConsentTemplateDetails from(ConsentTemplate template, String customContent) {
        return ConsentTemplateDetails.builder()
                .templateId(template.getId())
                .userProfileId(
                        template.getUserProfile() != null
                                ? template.getUserProfile().getId()
                                : null)
                .name(template.getName())
                .title(template.getTitle())
                .content(customContent)
                .isActive(template.getIsActive())
                .placeholders(template.getPlaceholders())
                .type(template.getType())
                .location(template.getLocation())
                .isDefault(template.getIsDefault())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
