package com.dentalstack.patient.feature.rewards.service;

import com.dentalstack.patient.feature.rewards.dto.request.CreateProductConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.request.UpdateProductConfigRequest;
import com.dentalstack.patient.feature.rewards.dto.response.ProductConfigListResponse;
import com.dentalstack.patient.feature.rewards.dto.response.ProductConfigResponse;
import java.io.IOException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

public interface RewardProductConfigService {

    @Transactional(readOnly = true)
    ProductConfigListResponse getAllProducts(Long userProfileId);

    @Transactional
    ProductConfigResponse createProduct(CreateProductConfigRequest request);

    @Transactional
    ProductConfigResponse createProduct(CreateProductConfigRequest request, MultipartFile file) throws IOException;

    @Transactional
    ProductConfigResponse updateProduct(UpdateProductConfigRequest request);

    @Transactional
    ProductConfigResponse updateProduct(UpdateProductConfigRequest request, MultipartFile file) throws IOException;

    @Transactional
    ProductConfigResponse updateInventory(Long userProfileId, Long productId, Integer quantity, String operation);

    @Transactional
    void deleteProduct(Long userProfileId, Long productId);
}
