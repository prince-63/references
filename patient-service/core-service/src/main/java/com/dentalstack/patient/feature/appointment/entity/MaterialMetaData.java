package com.dentalstack.patient.feature.appointment.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = MaterialMetaDataSet.class, name = "MaterialMetaDataSet"),
})
@AllArgsConstructor
@Data
public abstract class MaterialMetaData implements Serializable {

    private String shape;
    private String materialName;
    private String materialSize;
    private List<String> spaceEnclosureTools;
    private List<String> accessories;
    private String treatmentStageType;
}
