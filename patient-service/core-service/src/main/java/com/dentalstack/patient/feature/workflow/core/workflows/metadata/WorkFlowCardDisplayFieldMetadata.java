package com.dentalstack.patient.feature.workflow.core.workflows.metadata;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Builder
@EqualsAndHashCode(callSuper = true)
public class WorkFlowCardDisplayFieldMetadata extends WorkFlowManagementMetadata implements Serializable {

    private String productType;
    private String productName;
    private String category;
    private String productDescription;
    private String productImage;
    private String productTag;

    @JsonCreator
    public WorkFlowCardDisplayFieldMetadata(
            @JsonProperty("productType") String productType,
            @JsonProperty("productName") String productName,
            @JsonProperty("category") String category,
            @JsonProperty("productDescription") String productDescription,
            @JsonProperty("productImage") String productImage,
            @JsonProperty("productTag") String productTag) {
        super(WorkFlowManagementMetadataType.WORKFLOW_CARD_DISPLAY_FIELD);
        this.productType = productType;
        this.productName = productName;
        this.category = category;
        this.productDescription = productDescription;
        this.productImage = productImage;
        this.productTag = productTag;
    }
}
