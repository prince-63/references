package com.dentalstack.patient.feature.api_registry.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "api_registry")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiRegistry extends BaseEntity {

    private String serviceName;

    @Column(nullable = false)
    private String path;

    @Column(nullable = false)
    private String method;

    @Column(nullable = false)
    private String handler;

    @Column(nullable = false)
    @Builder.Default
    private Long hitCount = 0L;
}
