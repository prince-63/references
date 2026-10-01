package com.dentalstack.patient.feature.material.entity;

import com.dentalstack.patient.feature.material.enums.MaterialShapeEnum;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "material_shape")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class MaterialShape extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private MaterialShapeEnum materialShape;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_stage_id")
    private MaterialTreatmentStage treatmentStage;
}
