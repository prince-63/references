package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.ZonedDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceProductV2Response {

    private Long id;
    private String productType;
    private String productName;
    private String productDescription;
    private String productImage;
    private WorkFlowManagementMetadata productMetadata;

    private ProductCategoryV2Response category;
    private ProductUserProfileDetails userProfileDetails;

    private Boolean isDefault;
    private Boolean isProductEnabled;
    private Boolean isDisabledForCustomer;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static ServiceProductV2Response from(ServiceProduct serviceProduct, Boolean isDisabledForCustomer) {
        if (serviceProduct == null) {
            return null;
        }

        return ServiceProductV2Response.builder()
                .id(serviceProduct.getId())
                .productType(serviceProduct.getProductType())
                .productName(serviceProduct.getProductName())
                .productDescription(serviceProduct.getProductDescription())
                .productImage(serviceProduct.getProductImage())
                .productMetadata(serviceProduct.getProductMetadata())
                .category(ProductCategoryV2Response.from(serviceProduct.getProductCategory()))
                .userProfileDetails(ProductUserProfileDetails.from(serviceProduct.getUserProfile()))
                .isDefault(serviceProduct.getIsDefault())
                .isProductEnabled(serviceProduct.getIsProductEnabled())
                .createdAt(serviceProduct.getCreatedAt())
                .updatedAt(serviceProduct.getUpdatedAt())
                .isDisabledForCustomer(isDisabledForCustomer)
                .build();
    }
}
