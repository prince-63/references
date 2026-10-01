package com.dentalstack.patient.feature.workflow.product.dto;

import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.function.Supplier;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceProductResponse {

    private Long id;

    private String productType;

    @NotBlank(message = "Product name is required")
    private String productName;

    private String productDescription;

    private String productImage;

    private WorkFlowManagementMetadata productMetadata;

    @NotNull(message = "Product category ID is required")
    private Long productCategoryId;

    private String productCategoryName;

    private Long profileId;

    private Boolean isDefault;

    private Boolean isProductEnabled;

    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    @Builder.Default
    private Boolean isLastUsed = false;

    private Boolean isDisabledForCustomer;
    private String addedByUserName;
    private Long organizationId;
    private Long doctorId;
    private String orgBrandName;

    public static ServiceProductResponse from(ServiceProduct serviceProduct) {
        return ServiceProductResponse.builder()
                .id(serviceProduct.getId())
                .productType(serviceProduct.getProductType())
                .productName(serviceProduct.getProductName())
                .productDescription(serviceProduct.getProductDescription())
                .productImage(serviceProduct.getProductImage())
                .productMetadata(serviceProduct.getProductMetadata())
                .productCategoryId(
                        safe(() -> serviceProduct.getProductCategory().getId()))
                .productCategoryName(
                        safe(() -> serviceProduct.getProductCategory().getName()))
                .profileId(safe(() -> serviceProduct.getUserProfile().getId()))
                .organizationId(safe(
                        () -> serviceProduct.getUserProfile().getOrganization().getId()))
                .doctorId(safe(() -> serviceProduct.getUserProfile().getDoctor().getId()))
                .addedByUserName(
                        safe(() -> serviceProduct.getUserProfile().getUser().fullNameWithSalutation()))
                .orgBrandName(safe(
                        () -> serviceProduct.getUserProfile().getDoctorBilling().getCompanyBrandName()))
                .isProductEnabled(serviceProduct.getIsProductEnabled())
                .isDefault(serviceProduct.getIsDefault())
                .createdAt(serviceProduct.getCreatedAt())
                .updatedAt(serviceProduct.getUpdatedAt())
                .isLastUsed(false)
                .build();
    }

    public static ServiceProductResponse from(ServiceProduct serviceProduct, Boolean isDisabledForCustomer) {
        return ServiceProductResponse.builder()
                .id(serviceProduct.getId())
                .productType(serviceProduct.getProductType())
                .productName(serviceProduct.getProductName())
                .productDescription(serviceProduct.getProductDescription())
                .productImage(serviceProduct.getProductImage())
                .productMetadata(serviceProduct.getProductMetadata())
                .productCategoryId(
                        safe(() -> serviceProduct.getProductCategory().getId()))
                .productCategoryName(
                        safe(() -> serviceProduct.getProductCategory().getName()))
                .profileId(safe(() -> serviceProduct.getUserProfile().getId()))
                .organizationId(safe(
                        () -> serviceProduct.getUserProfile().getOrganization().getId()))
                .doctorId(safe(() -> serviceProduct.getUserProfile().getDoctor().getId()))
                .addedByUserName(
                        safe(() -> serviceProduct.getUserProfile().getUser().fullNameWithSalutation()))
                .orgBrandName(safe(
                        () -> serviceProduct.getUserProfile().getDoctorBilling().getCompanyBrandName()))
                .isProductEnabled(serviceProduct.getIsProductEnabled())
                .isDefault(serviceProduct.getIsDefault())
                .createdAt(serviceProduct.getCreatedAt())
                .updatedAt(serviceProduct.getUpdatedAt())
                .isLastUsed(false)
                .isDisabledForCustomer(isDisabledForCustomer)
                .build();
    }

    private static <T> T safe(Supplier<T> supplier) {
        try {
            return supplier.get();
        } catch (NullPointerException e) {
            return null;
        }
    }
}
