package com.dentalstack.patient.feature.timeline.metadata.feedback;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.io.Serializable;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AlignerFittingFeedback implements Serializable {
    private Set<Fitting> fittings;

    public enum Fitting {
        PERFECT_FIT,
        NOT_FITTING,
        LOOSE_AT_BACK,
        LOOSE_AT_FRONT
    }
}
