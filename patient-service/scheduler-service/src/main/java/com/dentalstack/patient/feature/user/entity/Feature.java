package com.dentalstack.patient.feature.user.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Entity
@Table(
        name = "feature",
        indexes = {@Index(name = "UX_feature_name", columnList = "name", unique = true)})
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feature extends BaseEntity {
    @NotNull
    private String name;

    private String description;

    @ManyToMany
    @Builder.Default
    private Set<Role> roles = new HashSet<>();
}
