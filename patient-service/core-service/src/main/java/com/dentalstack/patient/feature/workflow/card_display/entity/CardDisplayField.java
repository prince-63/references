package com.dentalstack.patient.feature.workflow.card_display.entity;

import com.dentalstack.patient.feature.workflow.card_display.enums.DisplayTypeEnum;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "card_display_fields")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class CardDisplayField extends BaseEntity {

    private String fieldKey;

    private String label;

    @Builder.Default
    private Boolean enabled = false;

    @Builder.Default
    private Integer position = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "display_type", nullable = false)
    @Builder.Default
    private DisplayTypeEnum displayType = DisplayTypeEnum.TEXT;

    private String sampleValue;

    @Builder.Default
    private Boolean showInPreview = true;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private WorkFlowManagementMetadata metadata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "config_id")
    private CardDisplayConfig config;
}
