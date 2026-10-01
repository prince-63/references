package com.dentalstack.patient.feature.treatment.entity;

import com.dentalstack.patient.feature.treatment.dto.LowerJawDetails;
import com.dentalstack.patient.feature.treatment.dto.UpperJawDetails;
import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.*;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class AlignerDetailsMetadataSet extends AlignerDetailsMetadata {
    private UpperJawDetails upperJawDetails;
    private LowerJawDetails lowerJawDetails;

    @JsonCreator
    public AlignerDetailsMetadataSet(UpperJawDetails upperJawDetails, LowerJawDetails lowerJawDetails) {
        super(upperJawDetails, lowerJawDetails);
        this.upperJawDetails = upperJawDetails;
        this.lowerJawDetails = lowerJawDetails;
    }
}
