package com.dentalstack.patient.feature.caseinfo;

import com.dentalstack.patient.feature.caseinfo.enums.AllergyStatus;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import java.io.Serializable;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class AllergyInformation implements Serializable {
    private AllergyStatus metalAllergy;
    private AllergyStatus plasticAllergy;
    private AllergyStatus monomerAllergy;
}
