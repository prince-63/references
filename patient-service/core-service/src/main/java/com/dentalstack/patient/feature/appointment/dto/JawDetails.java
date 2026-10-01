package com.dentalstack.patient.feature.appointment.dto;

import com.dentalstack.patient.feature.aligner.enums.aligner.JawType;
import com.dentalstack.patient.feature.appointment.entity.Jaw;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class JawDetails {
    private String materialName;
    private String materialSize;
    private List<String> spaceEnclosureTools;
    private List<String> accessories;
    private String note;
    private String shape;
    private String treatmentStageType;

    @JsonProperty("jaw_type")
    @Enumerated(EnumType.STRING)
    private JawType jawType;

    public static JawDetails from(Jaw jaw) {
        return JawDetails.builder()
                .jawType(jaw.getJawType())
                .materialName(jaw.getMaterialMetaData().getMaterialName())
                .spaceEnclosureTools(jaw.getMaterialMetaData().getSpaceEnclosureTools())
                .accessories(jaw.getMaterialMetaData().getAccessories())
                .treatmentStageType(jaw.getMaterialMetaData().getTreatmentStageType())
                .note(jaw.getNote())
                .materialSize(jaw.getMaterialMetaData().getMaterialSize())
                .shape(jaw.getMaterialMetaData().getShape())
                .build();
    }
}
