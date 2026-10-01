package com.dentalstack.patient.feature.material.entity;

import com.dentalstack.patient.feature.material.enums.MaterialStageType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "material_treatment_stage")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class MaterialTreatmentStage extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private MaterialStageType materialStageType;
}
