package com.dentalstack.patient.feature.workflow.product.util;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.workflow.product.entity.ProductCategory;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.repository.CustomerAdminProductMappingRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ProductCategoryRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ServiceProductSeedData {

    private final ServiceProductRepository serviceProductRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final CustomerAdminProductMappingRepository customerAdminProductMappingRepository;

    public ProductCategory getPlanningServiceCategory() {
        return productCategoryRepository.findByName("PLANNING");
    }

    public ProductCategory getAlignerCategoryWithManufacturingOnly() {
        return productCategoryRepository.findByName("ALIGNERS(MANUFACTURING)");
    }

    public ProductCategory getAlignerCategoryWithPlanningAndManufacturing() {
        return productCategoryRepository.findByName("ALIGNERS(PLANNING + MANUFACTURING)");
    }

    public ProductCategory getAlignerCategoryWithVspPlanning() {
        return productCategoryRepository.findByName("VSP PLANNING");
    }

    public void seedServiceProductForGrowthUser(UserProfile userProfile) {
        List<ServiceProduct> serviceProducts = List.of();
        if (userProfile.isInHouseManufacturingLab()
                || userProfile.isEnterpriseOrDesignLab()
                || userProfile.isEnterpriseOrDesignLab()) {
            ServiceProduct alignerProduct = ServiceProduct.builder()
                    .productType("ALIGNER")
                    .productName("Aligners")
                    .productDescription("Premium high quality Aligners")
                    .productImage(
                            "https://prod-patient-gallery-ds.s3.ap-south-1.amazonaws.com/product/1232/profile_picture/image.png")
                    .productCategory(getAlignerCategoryWithPlanningAndManufacturing())
                    .isDefault(true)
                    .isProductEnabled(true)
                    .userProfile(userProfile)
                    .productMetadata(null)
                    .build();
            serviceProducts = List.of(alignerProduct);
        }
        if (!serviceProducts.isEmpty()) {
            serviceProductRepository.saveAll(serviceProducts);
        }
    }

    public void seedServiceProductForPlanning(UserProfile userProfile) {
        ServiceProduct planningProduct = ServiceProduct.builder()
                .productType("SERVICE")
                .productName("Expert Aligner Planning")
                .productDescription("Precise, clinician-led digital planning for predictable aligner results.")
                .productImage(
                        "https://prod-patient-gallery-ds.s3.ap-south-1.amazonaws.com/product/1176/profile_picture/planning.jpg")
                .productCategory(getPlanningServiceCategory())
                .isDefault(true)
                .isProductEnabled(true)
                .userProfile(userProfile)
                .productMetadata(null)
                .build();
        serviceProductRepository.save(planningProduct);
    }

    public void seedServiceProductForManufacturing(UserProfile userProfile) {
        ServiceProduct manufacturingProduct = ServiceProduct.builder()
                .productType("MANUFACTURING_SERVICE")
                .productName("White Labelled Aligners")
                .productDescription("Premium High Quality Aligners")
                .productImage(
                        "https://prod-patient-gallery-ds.s3.ap-south-1.amazonaws.com/product/1176/profile_picture/manufacturing.png")
                .productCategory(getAlignerCategoryWithManufacturingOnly())
                .isDefault(true)
                .isProductEnabled(true)
                .userProfile(userProfile)
                .productMetadata(null)
                .build();
        serviceProductRepository.save(manufacturingProduct);
    }

    public void seedServiceProductForVspPlanningService(UserProfile userProfile) {
        List<ServiceProduct> products = List.of(
                createProduct("VSP (3D)", "3D Surgical Planning", userProfile),
                createProduct("VSP with Splints", "3D Planning & 3D Printed Surgical Guides", userProfile),
                createProduct("2D Planning", "Ceph analysis & 2D Profile simulation", userProfile),
                createProduct("Only Genioplasty (3D)", "Frontal & Lateral 3D simulation of Genioplasty", userProfile),
                createProduct("Only Genioplasty (2D)", "2D Profile simulation of Genioplasty", userProfile));

        serviceProductRepository.saveAll(products);
    }

    private ServiceProduct createProduct(String name, String description, UserProfile userProfile) {
        return ServiceProduct.builder()
                .productType("VSP_PLANNING_SERVICE")
                .productName(name)
                .productDescription(description)
                .productImage(null)
                .productCategory(getAlignerCategoryWithVspPlanning())
                .isDefault(true)
                .isProductEnabled(true)
                .userProfile(userProfile)
                .productMetadata(null)
                .build();
    }
}
