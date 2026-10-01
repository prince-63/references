package com.dentalstack.patient.feature.rbac.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "sub_module")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubModule extends BaseEntity {
    @NotNull
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;
}
