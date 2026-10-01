package com.dentalstack.patient.feature.treatment.entity.caseinfo;

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
@Table(name = "braces_anchor_type_treatment")
public class AnchorTypeTreatment extends BaseEntity {

    private Long doctorId;

    private String upperJawAnchorageType;
    private String lowerJawAnchorageType;

    private String upperJawRetention;
    private String lowerJawRetention;

    private boolean isCommon;
}
