package com.dentalstack.patient.feature.appointment.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.List;
import lombok.*;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class MaterialMetaDataSet extends MaterialMetaData {
    private String shape;
    private String materialName;
    private String materialSize;
    private List<String> spaceEnclosureTools;
    private List<String> accessories;
    private String treatmentStageType;

    @JsonCreator
    public MaterialMetaDataSet(
            String shape,
            String materialName,
            String materialSize,
            List<String> spaceEnclosureTools,
            List<String> accessories,
            String treatmentStageType) {
        super(shape, materialName, materialSize, spaceEnclosureTools, accessories, treatmentStageType);
        this.shape = shape;
        this.materialName = materialName;
        this.materialSize = materialSize;
        this.spaceEnclosureTools = spaceEnclosureTools;
        this.accessories = accessories;
        this.treatmentStageType = treatmentStageType;
    }
}
