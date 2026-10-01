package com.dentalstack.patient.feature.material.entity;

import com.dentalstack.patient.feature.material.enums.MaterialToolType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "material_tool")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class MaterialTool extends BaseEntity {

    @Enumerated(EnumType.STRING)
    private MaterialToolType materialToolType;

    private Long doctorId;

    private Boolean isCommon;

    private String materialToolName;
}
