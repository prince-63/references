package com.dentalstack.patient.feature.material.entity;

import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "material")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class Material extends BaseEntity {

    private String name;

    @ManyToOne
    @JoinColumn(name = "shape_id")
    private MaterialShape shape;

    private Long doctorId;

    private Boolean isCommon;
}
