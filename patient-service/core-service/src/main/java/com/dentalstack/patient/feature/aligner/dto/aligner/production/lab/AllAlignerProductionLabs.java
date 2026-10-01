package com.dentalstack.patient.feature.aligner.dto.aligner.production.lab;

import com.dentalstack.patient.feature.aligner.entity.production.AlignerProductionLab;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllAlignerProductionLabs implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private List<AlignerProductionLabDetails> labs;

    public static AllAlignerProductionLabs from(List<AlignerProductionLab> labs) {
        return new AllAlignerProductionLabs(
                labs.stream().map(AlignerProductionLabDetails::from).toList());
    }
}
