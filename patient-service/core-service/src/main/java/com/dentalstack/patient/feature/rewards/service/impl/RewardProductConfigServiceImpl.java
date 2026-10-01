package com.dentalstack.patient.feature.rewards.service.impl;

import com.dentalstack.patient.feature.rewards.dto.request.*;
import com.dentalstack.patient.feature.rewards.dto.response.*;
import com.dentalstack.patient.feature.rewards.entity.RewardProductConfig;
import com.dentalstack.patient.feature.rewards.enums.ProductStatus;
import com.dentalstack.patient.feature.rewards.repository.RewardProductConfigRepository;
import com.dentalstack.patient.feature.rewards.service.RewardProductConfigService;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.global.exception.GenericException;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardProductConfigServiceImpl implements RewardProductConfigService {

    private final RewardProductConfigRepository productConfigRepository;
    private final UserProfileRepository userProfileRepository;
    private final AmazonS3Service amazonS3Service;

    @Value("${app.cloud.amazon.s3.bucket.patient}")
    private String profilePictureBucket;

    @Transactional(readOnly = true)
    @Override
    public ProductConfigListResponse getAllProducts(Long userProfileId) {
        log.info("Fetching all products for userProfileId: {}", userProfileId);

        List<RewardProductConfig> products =
                productConfigRepository.findByUserProfileIdAndIsActiveTrueOrderByDisplayOrderAsc(userProfileId);

        List<ProductConfigResponse> productResponses =
                products.stream().map(this::mapToResponse).collect(Collectors.toList());

        return ProductConfigListResponse.builder()
                .products(productResponses)
                .totalCount(products.size())
                .build();
    }

    @Transactional
    @Override
    public ProductConfigResponse createProduct(CreateProductConfigRequest request) {
        log.info(
                "Creating product for userProfileId: {}, productName: {}",
                request.getProfileId(),
                request.getProductName());

        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new RuntimeException("UserProfile not found"));

        ProductStatus status = determineProductStatus(
                request.getInventoryCount(),
                request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10);

        RewardProductConfig product = RewardProductConfig.builder()
                .userProfile(userProfile)
                .productName(request.getProductName())
                .productDescription(request.getProductDescription())
                .category(request.getCategory())
                .coinCost(request.getCoinCost())
                .monetaryValue(request.getMonetaryValue())
                .inventoryCount(request.getInventoryCount())
                .status(status)
                .termsAndConditions(request.getTermsAndConditions())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .isActive(true)
                .build();

        RewardProductConfig saved = productConfigRepository.save(product);
        log.info("Product created successfully with id: {}", saved.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductConfigResponse createProduct(CreateProductConfigRequest request, MultipartFile image)
            throws IOException {
        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new RuntimeException("UserProfile not found"));

        ProductStatus status = determineProductStatus(
                request.getInventoryCount(),
                request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10);
        String url = null;
        if (image != null && !image.isEmpty() && image.getSize() > 0) {
            url = amazonS3Service.storeFile(
                    profilePictureBucket,
                    getProductImageKey(request.getProfileId(), image.getOriginalFilename()),
                    image);
        }
        RewardProductConfig product = RewardProductConfig.builder()
                .userProfile(userProfile)
                .productName(request.getProductName())
                .productDescription(request.getProductDescription())
                .category(request.getCategory())
                .coinCost(request.getCoinCost())
                .monetaryValue(request.getMonetaryValue())
                .inventoryCount(request.getInventoryCount())
                .status(status)
                .termsAndConditions(request.getTermsAndConditions())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .isActive(true)
                .imageUrl(url)
                .build();

        RewardProductConfig saved = productConfigRepository.save(product);

        return mapToResponse(saved);
    }

    private String getProductImageKey(Long profileId, String fileName) {
        return String.join("/", "product", Long.toString(profileId), "reward_products", fileName);
    }

    @Transactional
    @Override
    public ProductConfigResponse updateProduct(UpdateProductConfigRequest request) {
        log.info("Updating product id: {} for userProfileId: {}", request.getProductId(), request.getProfileId());

        RewardProductConfig product = productConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(request.getProductId(), request.getProfileId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getProductName() != null) {
            product.setProductName(request.getProductName());
        }
        if (request.getProductDescription() != null) {
            product.setProductDescription(request.getProductDescription());
        }
        if (request.getCoinCost() != null) {
            product.setCoinCost(request.getCoinCost());
        }
        if (request.getMonetaryValue() != null) {
            product.setMonetaryValue(request.getMonetaryValue());
        }

        if (request.getTermsAndConditions() != null) {
            product.setTermsAndConditions(request.getTermsAndConditions());
        }
        if (request.getDisplayOrder() != null) {
            product.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());

            product.setStatus(determineProductStatus(product.getInventoryCount(), request.getLowStockThreshold()));
        }

        RewardProductConfig updated = productConfigRepository.save(product);
        log.info("Product updated successfully: {}", updated.getId());

        return mapToResponse(updated);
    }

    @Transactional
    @Override
    public ProductConfigResponse updateProduct(UpdateProductConfigRequest request, MultipartFile image)
            throws IOException {

        RewardProductConfig product = productConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(request.getProductId(), request.getProfileId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (image != null && !image.isEmpty() && image.getSize() > 0) {
            String url = amazonS3Service.storeFile(
                    profilePictureBucket,
                    getProductImageKey(request.getProfileId(), image.getOriginalFilename()),
                    image);
            product.setImageUrl(url);
        }

        if (request.getProductName() != null) {
            product.setProductName(request.getProductName());
        }
        if (request.getProductDescription() != null) {
            product.setProductDescription(request.getProductDescription());
        }
        if (request.getCoinCost() != null) {
            product.setCoinCost(request.getCoinCost());
        }
        if (request.getMonetaryValue() != null) {
            product.setMonetaryValue(request.getMonetaryValue());
        }
        if (request.getTermsAndConditions() != null) {
            product.setTermsAndConditions(request.getTermsAndConditions());
        }
        if (request.getDisplayOrder() != null) {
            product.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIsFeatured() != null) {
            product.setIsFeatured(request.getIsFeatured());
        }
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
            product.setStatus(determineProductStatus(product.getInventoryCount(), request.getLowStockThreshold()));
        }

        RewardProductConfig updated = productConfigRepository.save(product);

        return mapToResponse(updated);
    }

    @Transactional
    @Override
    public ProductConfigResponse updateInventory(
            Long userProfileId, Long productId, Integer quantity, String operation) {
        log.info("Updating inventory for product id: {}, operation: {}, quantity: {}", productId, operation, quantity);

        RewardProductConfig product = productConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(productId, userProfileId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        int newInventory;
        if ("ADD".equalsIgnoreCase(operation)) {
            newInventory = product.getInventoryCount() + quantity;
        } else if ("SET".equalsIgnoreCase(operation)) {
            newInventory = quantity;
        } else {
            throw new RuntimeException("Invalid operation. Use ADD or SET");
        }

        product.setInventoryCount(newInventory);
        product.setStatus(determineProductStatus(newInventory, product.getLowStockThreshold()));

        RewardProductConfig updated = productConfigRepository.save(product);
        log.info("Inventory updated. New count: {}, Status: {}", updated.getInventoryCount(), updated.getStatus());

        return mapToResponse(updated);
    }

    @Transactional
    @Override
    public void deleteProduct(Long userProfileId, Long productId) {
        log.info("Deleting product id: {} for userProfileId: {}", productId, userProfileId);

        RewardProductConfig product = productConfigRepository
                .findByIdAndUserProfileIdAndIsActiveTrue(productId, userProfileId)
                .orElseThrow(() -> new GenericException("Product not found"));

        product.setIsActive(false);
        product.setStatus(ProductStatus.DISCONTINUED);
        productConfigRepository.save(product);

        log.info("Product soft deleted successfully");
    }

    private ProductStatus determineProductStatus(int inventoryCount, int lowStockThreshold) {
        if (inventoryCount == 0) {
            return ProductStatus.OUT_OF_STOCK;
        } else if (inventoryCount <= lowStockThreshold) {
            return ProductStatus.LOW_STOCK;
        } else {
            return ProductStatus.IN_STOCK;
        }
    }

    private ProductConfigResponse mapToResponse(RewardProductConfig product) {
        return ProductConfigResponse.builder()
                .id(product.getId())
                .productName(product.getProductName())
                .productDescription(product.getProductDescription())
                .category(product.getCategory())
                .coinCost(product.getCoinCost())
                .monetaryValue(product.getMonetaryValue())
                .inventoryCount(product.getInventoryCount())
                .status(product.getStatus())
                .imageUrl(product.getImageUrl())
                .termsAndConditions(product.getTermsAndConditions())
                .displayOrder(product.getDisplayOrder())
                .isFeatured(product.getIsFeatured())
                .lowStockThreshold(product.getLowStockThreshold())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
