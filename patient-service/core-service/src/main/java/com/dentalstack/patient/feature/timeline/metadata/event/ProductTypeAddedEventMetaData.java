package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.patient.dto.PatientDetails;
import com.dentalstack.patient.global.enums.ProductTypeName;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.io.Serial;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class ProductTypeAddedEventMetaData extends EventMetadata implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private PatientDetails patientDetails;
    private ProductTypeName productTypeName;

    @JsonCreator
    public ProductTypeAddedEventMetaData(PatientDetails patientDetails, ProductTypeName productTypeName) {
        super(EventMetadataType.PRODUCT_TYPE_ADDED);
        this.patientDetails = patientDetails;
        this.productTypeName = productTypeName;
    }
}
