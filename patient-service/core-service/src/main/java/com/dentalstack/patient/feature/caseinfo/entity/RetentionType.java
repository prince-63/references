package com.dentalstack.patient.feature.caseinfo.entity;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
@Entity
@Table(name = "braces_retention_type")
public class RetentionType extends BaseEntity {
    private String value;
    private Long doctorId;
    private JawType jawType;
    private boolean isCommon;
}
