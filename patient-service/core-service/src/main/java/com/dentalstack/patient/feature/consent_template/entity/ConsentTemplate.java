package com.dentalstack.patient.feature.consent_template.entity;

import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateLocation;
import com.dentalstack.patient.feature.consent_template.enums.ConsentTemplateType;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "consent_templates")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsentTemplate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_profile_id")
    private UserProfile userProfile;

    private String name;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Boolean isActive;

    @Type(JsonType.class)
    @Column(name = "placeholders", columnDefinition = "jsonb")
    private JsonNode placeholders;

    @Enumerated(EnumType.STRING)
    private ConsentTemplateType type;

    @Enumerated(EnumType.STRING)
    private ConsentTemplateLocation location;

    private Boolean isDefault;

    public void updateFrom(
            String name,
            String title,
            String content,
            Boolean isActive,
            ConsentTemplateType type,
            ConsentTemplateLocation location,
            Boolean isDefault,
            JsonNode placeholders) {
        this.name = name;
        this.title = title;
        this.content = content;
        this.isActive = isActive != null ? isActive : this.isActive;
        this.type = type;
        this.location = location;
        this.isDefault = isDefault != null ? isDefault : this.isDefault;
        if (placeholders != null) {
            this.placeholders = placeholders;
        }
    }
}
