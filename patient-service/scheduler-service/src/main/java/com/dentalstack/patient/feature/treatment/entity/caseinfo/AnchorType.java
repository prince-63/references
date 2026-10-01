package com.dentalstack.patient.feature.treatment.entity.caseinfo;

import com.dentalstack.patient.feature.treatment.enums.JawType;
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
@Table(name = "braces_anchor_type")
public class AnchorType extends BaseEntity {

    private JawType jawType;
    private boolean isCommon;
    private Long doctorId;
    private String value;
}
