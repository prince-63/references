package com.dentalstack.patient.feature.caseinfo;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.io.Serializable;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class ToothRelations implements Serializable {
    private Integer molar;
    private Integer canine;
    private Integer incisor;
    private Integer skeletal;
}
