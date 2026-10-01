package com.dentalstack.patient.feature.workflow.card_display.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.global.entity.BaseEntity;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import java.util.List;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "card_display_configs")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class CardDisplayConfig extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private UserProfile userProfile;

    @Column(name = "org_id")
    private Long orgId;

    private String name;

    @Builder.Default
    private Boolean active = true;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private WorkFlowManagementMetadata metadata;

    @OneToMany(mappedBy = "config", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CardDisplayField> cardDisplayFields;
}
