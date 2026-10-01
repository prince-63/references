package com.dentalstack.patient.feature.aligner.dto.aligner;

import com.dentalstack.patient.feature.aligner.entity.Aligner;
import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlignerSrNoDetails {
    private long alignerId;
    private int alignerSrNo;
    private JawType jawType;

    public static AlignerSrNoDetails from(Aligner aligner) {
        return new AlignerSrNoDetails(aligner.getId(), aligner.getSrNo(), aligner.getJawType());
    }
}
