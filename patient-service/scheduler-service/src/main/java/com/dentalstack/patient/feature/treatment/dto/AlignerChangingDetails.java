package com.dentalstack.patient.feature.treatment.dto;

import com.dentalstack.patient.feature.treatment.enums.JawType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlignerChangingDetails {

    private Boolean isCurrentAlignerChanging;
    private Integer previousCurrentAligner;
    private Integer nextCurrentAligner;
    private JawType previousCurrentAlignerJawType;
    private JawType nextCurrentAlignerJawType;
}
