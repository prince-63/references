package com.dentalstack.patient.feature.workflow.product.service;

import com.dentalstack.patient.feature.workflow.product.dto.*;
import com.dentalstack.patient.feature.workflow.product.entity.ProductCategory;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import java.io.IOException;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface ServiceProductService {
    ProductCategoryResponse createProductCategory(ProductCategoryRequest request);

    ProductCategoryResponse getProductCategoryById(Long categoryId);

    List<ProductCategoryResponse> getProductCategoriesByProfileId(Long profileId);

    ProductCategory getProductCategoryEntityById(Long categoryId);

    ServiceProductResponse createServiceProduct(ServiceProductRequest serviceProductDto, MultipartFile image)
            throws IOException;

    ServiceProductResponse getServiceProductById(Long productId);

    List<ServiceProductResponse> getServiceProductsByProfileId(Long profileId, String productType);

    List<ServiceProductResponse> getServiceProductsByCategoryId(Long categoryId);

    ServiceProductResponse updateServiceProduct(Long serviceProductId, ServiceProductRequest dto, MultipartFile image)
            throws IOException;

    ServiceProduct getServiceProductEntityById(Long productId);

    ServiceProduct toggleProductStatus(Long productId);

    ServiceProductFilterResponseDTO getServiceProductByFilter(ServiceProductFilterRequestDTO request);

    List<ProductCategoryResponse> getProductCategoryByFilter(ProductCategoryGetRequest request);

    void deleteServiceProduct(Long serviceProductId, Long profileId);

    void addDefaultProduct(DefaultServiceProductRequest request);
}
