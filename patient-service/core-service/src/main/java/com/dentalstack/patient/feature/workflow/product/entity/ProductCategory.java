package com.dentalstack.patient.feature.workflow.product.entity;

import com.dentalstack.patient.feature.workflow.product.dto.ProductCategoryRequest;
import com.dentalstack.patient.feature.workflow.product.enums.CategoryType;
import com.dentalstack.patient.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "product_categories")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class ProductCategory extends BaseEntity {

    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private CategoryType categoryType;

    @Column(name = "role_names", columnDefinition = "text[]")
    @Type(io.hypersistence.utils.hibernate.type.array.ListArrayType.class)
    private List<String> roleNames;

    @Builder.Default
    private Boolean isDefault = false;

    public static ProductCategory from(ProductCategoryRequest request) {
        return ProductCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : Boolean.FALSE)
                .categoryType(request.getCategoryType())
                .roleNames(request.getAllowedRoles())
                .build();
    }
}
