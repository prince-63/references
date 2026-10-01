package com.dentalstack.patient.feature.workflow.core.workflows.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.List;
import java.util.Map;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "workflow_service")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
@JsonIgnoreProperties(ignoreUnknown = true)
public class WorkflowService extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private UserProfile userProfile;

    @Column(name = "org_id")
    private Long orgId;

    private String subscriptionType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_products", columnDefinition = "jsonb")
    private List<String> serviceProducts;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "service_product_label", columnDefinition = "jsonb")
    private Map<String, String> serviceProductLabel;
}
