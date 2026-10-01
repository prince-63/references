package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
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
