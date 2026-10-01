package com.dentalstack.patient.feature.aligner.dto.alignertreatment;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.io.Serial;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AlignerTreatmentDetails implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private UpperJawDetails upperJaw;
    private LowerJawDetails lowerJaw;
}
