package com.dentalstack.patient.feature.caseinfo.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnchorTypeAddRequest {
    private long doctorId;
    private JawType jawType;
    private String value;
}
