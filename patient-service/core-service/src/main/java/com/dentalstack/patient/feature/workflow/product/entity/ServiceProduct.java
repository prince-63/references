package com.dentalstack.patient.feature.workflow.product.entity;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.core.workflows.metadata.WorkFlowManagementMetadata;
import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductRequest;
import com.dentalstack.patient.global.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "service_products")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Slf4j
public class ServiceProduct extends BaseEntity {

    private String productType;

    private String productName;

    private String productDescription;

    private String productImage;

    @org.hibernate.annotations.Type(JsonType.class)
    @Column(name = "product_metadata", columnDefinition = "jsonb")
    private WorkFlowManagementMetadata productMetadata;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_category_id")
    private ProductCategory productCategory;

    @Builder.Default
    private Boolean isDefault = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private UserProfile userProfile;

    private Boolean isProductEnabled;

    public static ServiceProduct from(
            ServiceProductRequest serviceProductDto, UserProfile userProfile, ProductCategory productCategory) {
        return ServiceProduct.builder()
                .productType(serviceProductDto.getProductType())
                .productName(serviceProductDto.getProductName())
                .productDescription(serviceProductDto.getProductDescription())
                .productImage(serviceProductDto.getProductImage())
                .isDefault(serviceProductDto.getIsDefault() != null ? serviceProductDto.getIsDefault() : false)
                .userProfile(userProfile)
                .productCategory(productCategory)
                .build();
    }

    public JsonNode toJsonNode() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode jsonNode = mapper.createObjectNode();

        jsonNode.put("id", this.getId());

        if (this.getCreatedAt() != null) {
            jsonNode.put("created_at", this.getCreatedAt().toString());
        }

        jsonNode.put("is_default", this.getIsDefault() != null ? this.getIsDefault() : false);

        if (this.getUpdatedAt() != null) {
            jsonNode.put("updated_at", this.getUpdatedAt().toString());
        }

        jsonNode.put("product_name", this.getProductName());
        jsonNode.put("product_type", this.getProductType());
        jsonNode.put("product_image", this.getProductImage() != null ? this.getProductImage() : "");

        if (this.getProductMetadata() != null) {
            jsonNode.set("product_metadata", mapper.valueToTree(this.getProductMetadata()));
        } else {
            jsonNode.putNull("product_metadata");
        }

        jsonNode.put("is_product_enabled", this.getIsProductEnabled() != null ? this.getIsProductEnabled() : true);

        if (this.getProductCategory() != null) {
            jsonNode.put("product_category_id", this.getProductCategory().getId());
            jsonNode.put("product_category_name", this.getProductCategory().getName());
        } else {
            jsonNode.putNull("product_category_id");
            jsonNode.put("product_category_name", "");
        }

        jsonNode.put("product_description", this.getProductDescription() != null ? this.getProductDescription() : "");

        return jsonNode;
    }

    public JsonNode toMinimalJsonNode() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode jsonNode = mapper.createObjectNode();

        jsonNode.put("id", this.getId());

        if (this.getUserProfile() != null) {
            jsonNode.put("profile_id", this.getUserProfile().getId());
        }

        jsonNode.put("product_name", this.getProductName());
        jsonNode.put("product_type", this.getProductType());

        if (this.getProductCategory() != null) {
            jsonNode.put("product_category_name", this.getProductCategory().getName());
        } else {
            jsonNode.put("product_category_name", "");
        }

        return jsonNode;
    }
}
