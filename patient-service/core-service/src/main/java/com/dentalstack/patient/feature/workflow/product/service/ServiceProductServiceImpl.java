package com.dentalstack.patient.feature.workflow.product.service;

import com.dentalstack.patient.feature.doctor.exception.DoctorNotFoundException;
import com.dentalstack.patient.feature.storage.s3.AmazonS3Service;
import com.dentalstack.patient.feature.user.entity.Role;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.product.dto.*;
import com.dentalstack.patient.feature.workflow.product.entity.LastUsedServiceProduct;
import com.dentalstack.patient.feature.workflow.product.entity.ProductCategory;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.enums.ServiceProductFor;
import com.dentalstack.patient.feature.workflow.product.exception.AtLeastOneServiceProductExistsException;
import com.dentalstack.patient.feature.workflow.product.exception.AtLeastOneServiceProductIsEnabledException;
import com.dentalstack.patient.feature.workflow.product.repository.LastUsedServiceProductRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ProductCategoryRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.feature.workflow.product.util.ServiceProductSeedData;
import com.dentalstack.patient.global.exception.GenericException;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceProductServiceImpl implements ServiceProductService {

    private final ServiceProductRepository serviceProductRepository;

    private final UserProfileRepository userProfileRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final LastUsedServiceProductRepository lastUsedServiceProductRepository;
    private final AmazonS3Service amazonS3Service;
    private final ServiceProductSeedData serviceProductSeedData;

    @Value("${app.cloud.amazon.s3.bucket.patient}")
    private String profilePictureBucket;

    @Override
    public ProductCategoryResponse createProductCategory(ProductCategoryRequest request) {

        if (productCategoryRepository.existsByNameAndProfileId(request.getName())) {
            throw new GenericException(
                    "Product category with name '" + request.getName() + "' already exists for this profile");
        }
        var productCategory = ProductCategory.from(request);
        ProductCategory savedCategory = productCategoryRepository.save(productCategory);

        return ProductCategoryResponse.from(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductCategoryResponse getProductCategoryById(Long categoryId) {

        ProductCategory category = getProductCategoryEntityById(categoryId);
        return ProductCategoryResponse.from(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryResponse> getProductCategoriesByProfileId(Long profileId) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(profileId)
                .orElseThrow(() -> new DoctorNotFoundException(profileId));

        var roles = userProfile.getRoles();

        Set<String> roleNames = roles.stream()
                .map(Role::getName)
                .filter(Objects::nonNull)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        if (roleNames.isEmpty()) {
            return new ArrayList<>();
        }

        List<ProductCategory> allCategories = productCategoryRepository.findAll();

        return allCategories.stream()
                .filter(category -> category.getRoleNames() != null
                        && category.getRoleNames().stream()
                                .map(String::toUpperCase)
                                .anyMatch(roleNames::contains))
                .map(ProductCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryResponse> getProductCategoryByFilter(ProductCategoryGetRequest request) {
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        var roles = userProfile.getRoles();

        Set<String> roleNames = roles.stream()
                .map(Role::getName)
                .filter(Objects::nonNull)
                .map(String::toUpperCase)
                .collect(Collectors.toSet());

        if (roleNames.isEmpty()) {
            return new ArrayList<>();
        }

        List<ProductCategory> allCategories = productCategoryRepository.findAll();

        return allCategories.stream()
                .filter(category -> category.getRoleNames() != null
                        && category.getRoleNames().stream()
                                .map(String::toUpperCase)
                                .anyMatch(roleNames::contains))
                .filter(category ->
                        request.getCategoryType() == null || category.getCategoryType() == request.getCategoryType())
                .map(ProductCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductCategory getProductCategoryEntityById(Long categoryId) {
        return productCategoryRepository
                .findById(categoryId)
                .orElseThrow(() -> new GenericException("Product category not found with ID: " + categoryId));
    }

    @Override
    public ServiceProductResponse createServiceProduct(ServiceProductRequest request, MultipartFile image)
            throws IOException {

        ProductCategory productCategory = getProductCategoryEntityById(request.getProductCategoryId());

        if (serviceProductRepository.existsByProductNameAndProfileId(
                request.getProductName(), request.getProfileId())) {
            throw new GenericException(
                    "Service product with name '" + request.getProductName() + "' already exists for this profile");
        }

        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getProfileId()));

        if (image != null && !image.isEmpty() && image.getSize() > 0) {
            String url = amazonS3Service.storeFile(
                    profilePictureBucket,
                    getProductImageKey(request.getProfileId(), image.getOriginalFilename()),
                    image);
            request.setProductImage(url);
        }

        ServiceProduct serviceProduct = ServiceProduct.from(request, userProfile, productCategory);
        serviceProduct.setIsProductEnabled(request.getIsProductEnabled());

        ServiceProduct savedProduct = serviceProductRepository.save(serviceProduct);

        return ServiceProductResponse.from(savedProduct);
    }

    private String getProductImageKey(Long profileId, String fileName) {
        return String.join("/", "product", Long.toString(profileId), "profile_picture", fileName);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceProductResponse getServiceProductById(Long productId) {

        ServiceProduct product = getServiceProductEntityById(productId);
        return ServiceProductResponse.from(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceProductResponse> getServiceProductsByProfileId(Long profileId, String productType) {

        List<ServiceProduct> products = serviceProductRepository.findByProfileIdAndProductType(profileId, productType);

        return products.stream().map(ServiceProductResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceProductResponse> getServiceProductsByCategoryId(Long categoryId) {

        List<ServiceProduct> products = serviceProductRepository.findByProductCategoryId(categoryId);
        return products.stream().map(ServiceProductResponse::from).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceProductResponse updateServiceProduct(
            Long serviceProductId, ServiceProductRequest dto, MultipartFile image) throws IOException {
        var existing = getServiceProductEntityById(serviceProductId);

        if (image != null && !image.isEmpty() && image.getSize() > 0) {
            String newUrl = amazonS3Service.storeFile(
                    profilePictureBucket,
                    getProductImageKey(
                            dto.getProfileId() != null
                                    ? dto.getProfileId()
                                    : existing.getUserProfile().getId(),
                            image.getOriginalFilename()),
                    image);
            amazonS3Service.deleteFile(
                    profilePictureBucket,
                    getProductImageKey(existing.getUserProfile().getId(), existing.getProductImage()));
            existing.setProductImage(newUrl);
        }

        if (dto.getProductCategoryId() != null) {
            var productCategory = getProductCategoryEntityById(dto.getProductCategoryId());
            existing.setProductCategory(productCategory);
        }

        if (dto.getProfileId() != null) {
            var userProfile = userProfileRepository
                    .findById(dto.getProfileId())
                    .orElseThrow(() -> new DoctorNotFoundException(dto.getProfileId()));
            existing.setUserProfile(userProfile);
        }

        if (dto.getIsProductEnabled() != null) {
            Long count = getServiceProductCountForProfileId(dto.getProfileId());
            if (count == 1 && !dto.getIsProductEnabled()) {
                throw new AtLeastOneServiceProductIsEnabledException(
                        "At least one service product must be enabled for the profile");
            }
            existing.setIsProductEnabled(
                    dto.getIsProductEnabled() != null ? dto.getIsProductEnabled() : existing.getIsProductEnabled());
        }
        existing.setIsProductEnabled(
                dto.getIsProductEnabled() != null ? dto.getIsProductEnabled() : existing.getIsProductEnabled());
        existing.setProductType(dto.getProductType() != null ? dto.getProductType() : existing.getProductType());
        existing.setProductName(dto.getProductName() != null ? dto.getProductName() : existing.getProductName());
        existing.setProductDescription(
                dto.getProductDescription() != null ? dto.getProductDescription() : existing.getProductDescription());
        existing.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : existing.getIsDefault());

        serviceProductRepository.save(existing);
        return ServiceProductResponse.from(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceProduct getServiceProductEntityById(Long productId) {
        ServiceProduct serviceProduct = serviceProductRepository
                .findByIdWithAssociations(productId)
                .orElseThrow(() -> new GenericException("Service product not found with ID: " + productId));
        log.info(serviceProduct.getProductCategory().getName());

        return serviceProduct;
    }

    public Long getServiceProductCountForProfileId(Long profileId) {
        return serviceProductRepository.countEnabledServiceProductByProfileId(profileId);
    }

    @Override
    @Transactional
    public ServiceProduct toggleProductStatus(Long productId) {
        serviceProductRepository.toggleProductStatus(productId);
        return serviceProductRepository.findServiceProductById(productId);
    }

    @Override
    public ServiceProductFilterResponseDTO getServiceProductByFilter(ServiceProductFilterRequestDTO request) {
        List<ServiceProductResponse> ownerProducts = new ArrayList<>();
        List<ServiceProductResponse> vendorProducts = new ArrayList<>();

        var adminWithDefaultTag = userProfileRepository.isAdminWithDefaultTag(request.getOwnerProfileId());
        var userProfile = userProfileRepository
                .findByIdWithOrgAndDoctorAndUser(request.getOwnerProfileId())
                .orElseThrow(() -> new DoctorNotFoundException(request.getOwnerProfileId()));
        if (adminWithDefaultTag && userProfile.getInviterProfile() != null) {
            userProfile = userProfile.getInviterProfile();
            request.setOwnerProfileId(userProfile.getId());
        }

        Optional<LastUsedServiceProduct> lastUsedProduct =
                lastUsedServiceProductRepository.findByUserProfileId(request.getOwnerProfileId());
        Long lastUsedProductId =
                lastUsedProduct.map(LastUsedServiceProduct::getProductId).orElse(null);

        if (request.getOwnerProfileId() != null) {
            List<ServiceProduct> ownerEntities = serviceProductRepository.findAllByOwnerProfileId(
                    request.getSearch(),
                    request.getProductType(),
                    request.getCategoryId(),
                    request.getCategoryName(),
                    request.getOwnerProfileId(),
                    request.getIsProductEnabled());
            ownerProducts = ownerEntities.stream()
                    .map(entity -> {
                        ServiceProductResponse response = ServiceProductResponse.from(entity);
                        response.setIsLastUsed(Objects.equals(entity.getId(), lastUsedProductId));
                        return response;
                    })
                    .toList();
        }
        if (request.getVendorProfileIds() != null
                && !request.getVendorProfileIds().isEmpty()) {
            List<ServiceProduct> vendorEntities = serviceProductRepository.findAllByVendorProfileId(
                    request.getSearch(),
                    request.getProductType(),
                    request.getCategoryId(),
                    request.getCategoryName(),
                    request.getVendorProfileIds(),
                    request.getIsProductEnabled());
            vendorProducts = vendorEntities.stream()
                    .map(entity -> {
                        ServiceProductResponse response = ServiceProductResponse.from(entity);
                        response.setIsLastUsed(Objects.equals(entity.getId(), lastUsedProductId));
                        return response;
                    })
                    .toList();
        }

        ServiceProductFilterResponseDTO response = new ServiceProductFilterResponseDTO();
        response.setOwnerProducts(ownerProducts);
        response.setVendorProducts(vendorProducts);
        return response;
    }

    @Override
    public void deleteServiceProduct(Long serviceProductId, Long profileId) {
        Long count = serviceProductRepository.countServiceProductByProfileId(profileId);

        if (count != null && count == 1) {
            throw new AtLeastOneServiceProductExistsException(
                    "At least one service product must exist for the profile.");
        }

        Optional<ServiceProduct> serviceProduct = serviceProductRepository.findById(serviceProductId);
        if (serviceProduct.isPresent()) {
            serviceProductRepository.delete(serviceProduct.get());
        } else {
            throw new GenericException("Service product not found with ID: " + serviceProductId);
        }
    }

    @Override
    public void addDefaultProduct(DefaultServiceProductRequest request) {
        UserProfile userProfile = userProfileRepository
                .findById(request.getProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getProfileId()));

        ServiceProductFor serviceProductFor =
                ServiceProductFor.valueOf(request.getServiceProductFor().toUpperCase());

        switch (serviceProductFor) {
            case PLANNING -> {
                serviceProductSeedData.seedServiceProductForPlanning(userProfile);
            }
            case MANUFACTURING -> {
                serviceProductSeedData.seedServiceProductForManufacturing(userProfile);
            }
            case VSP_PLANNING -> {
                serviceProductSeedData.seedServiceProductForVspPlanningService(userProfile);
            }
        }
    }
}
