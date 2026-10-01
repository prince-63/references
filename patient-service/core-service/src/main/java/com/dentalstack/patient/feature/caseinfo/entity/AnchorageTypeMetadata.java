package com.dentalstack.patient.feature.caseinfo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnchorageTypeMetadata {
    private String upperJawAnchorageType;
    private String upperJawRetentionType;
    private String lowerJawAnchorageType;
    private String lowerJawRetentionType;
}
