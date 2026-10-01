package com.dentalstack.patient.feature.workflow.product.service;

import com.dentalstack.patient.feature.user.entity.UserProfile;
import com.dentalstack.patient.feature.user.exception.UserNotFoundException;
import com.dentalstack.patient.feature.user.repository.UserProfileRepository;
import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductAssigneeRequest;
import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductFilterRequest;
import com.dentalstack.patient.feature.workflow.product.dto.CustomerAdminProductFilterResponse;
import com.dentalstack.patient.feature.workflow.product.dto.ServiceProductResponse;
import com.dentalstack.patient.feature.workflow.product.entity.CustomerAdminProductMapping;
import com.dentalstack.patient.feature.workflow.product.entity.ServiceProduct;
import com.dentalstack.patient.feature.workflow.product.exception.AtLeastOneServiceProductExistsException;
import com.dentalstack.patient.feature.workflow.product.exception.ServiceProductNotFoundException;
import com.dentalstack.patient.feature.workflow.product.repository.CustomerAdminProductMappingRepository;
import com.dentalstack.patient.feature.workflow.product.repository.ServiceProductRepository;
import com.dentalstack.patient.feature.workflow.service_configuration.repository.ServiceConfigurationRepository;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerAdminProductMappingServiceImpl implements CustomerAdminProductMappingService {

    private final ServiceProductRepository serviceProductRepository;
    private final CustomerAdminProductMappingRepository customerAdminProductMappingRepository;
    private final UserProfileRepository userProfileRepository;
    private final ServiceConfigurationRepository serviceConfigurationRepository;

    @Transactional
    @Override
    public void assigneeToCustomer(CustomerAdminProductAssigneeRequest request) {
        UserProfile assigneeProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getAssigneeProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getAssigneeProfileId()));
        UserProfile ownerProfile = userProfileRepository
                .findByIdWithOrgAndDoctor(request.getOwnerProfileId())
                .orElseThrow(() -> new UserNotFoundException(request.getOwnerProfileId()));
        var serviceProduct = serviceProductRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new ServiceProductNotFoundException(
                        "Service Product not found with id: " + request.getProductId()));
        var customerAdminProductMapping = CustomerAdminProductMapping.builder()
                .assignee(assigneeProfile)
                .userProfile(ownerProfile)
                .serviceProduct(serviceProduct)
                .build();
        customerAdminProductMappingRepository.save(customerAdminProductMapping);
    }

    @Transactional
    @Override
    public void removeFromCustomer(CustomerAdminProductAssigneeRequest request) {
        Long count = customerAdminProductMappingRepository.countEnabledServiceProductByOwnerAndCustomer(
                request.getAssigneeProfileId(), request.getOwnerProfileId());
        if (count != null && count == 1) {
            throw new AtLeastOneServiceProductExistsException(
                    "At least one service product must exist for the customer.");
        }
        customerAdminProductMappingRepository.deleteByAssigneeIdAndOwnerIdAndProductId(
                request.getAssigneeProfileId(), request.getOwnerProfileId(), request.getProductId());
    }

    @Override
    public CustomerAdminProductFilterResponse getProductsForCustomer(CustomerAdminProductFilterRequest request) {
        Optional<UserProfile> dbUser = userProfileRepository.findById(request.getProfileId());
        CustomerAdminProductFilterResponse productResponse = new CustomerAdminProductFilterResponse();

        List<ServiceProduct> products = new ArrayList<>();
        dbUser.ifPresent(user -> {
            List<ServiceProduct> thereProducts = serviceProductRepository.findAllByOwnerProfileId(
                    request.getSearch(),
                    request.getProductType(),
                    request.getCategoryId(),
                    request.getCategoryName(),
                    request.getProfileId(),
                    request.getIsProductEnabled());
            List<ServiceProduct> adminProducts =
                    customerAdminProductMappingRepository.findAllProductsByCustomerProfileId(
                            request.getSearch(),
                            request.getProductType(),
                            request.getCategoryId(),
                            request.getCategoryName(),
                            request.getProfileId());
            if (!thereProducts.isEmpty()) {
                products.addAll(thereProducts);
            }
            if (!adminProducts.isEmpty()) {
                products.addAll(adminProducts);
            }

            List<ServiceProductResponse> mappedProduct =
                    products.stream().map(ServiceProductResponse::from).toList();

            productResponse.setProducts(mappedProduct);
        });
        return productResponse;
    }
}
