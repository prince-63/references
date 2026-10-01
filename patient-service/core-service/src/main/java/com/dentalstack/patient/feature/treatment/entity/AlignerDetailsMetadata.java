package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.aligner.dto.alignertreatment.LowerJawDetails;
import com.dentalstack.patient.feature.aligner.dto.alignertreatment.UpperJawDetails;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = AlignerDetailsMetadataSet.class, name = "AlignerDetailsMetaDataSet"),
})
@AllArgsConstructor
@Data
public abstract class AlignerDetailsMetadata implements Serializable {
    private UpperJawDetails upperJawDetails;
    private LowerJawDetails lowerJawDetails;
}
